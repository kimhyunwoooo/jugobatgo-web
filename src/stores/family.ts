import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

export interface FamilyMember {
  id: string
  user_id: string
  nickname: string | null
  profile_image: string | null
  joined_at: string
}

export interface Family {
  id: string
  code: string
  created_by: string
  created_at: string
}

export const useFamilyStore = defineStore('family', () => {
  const family = ref<Family | null>(null)
  const members = ref<FamilyMember[]>([])
  const loading = ref(false)

  const authStore = useAuthStore()

  const isInFamily = computed(() => !!family.value)
  const familyCode = computed(() => family.value?.code || null)
  const memberCount = computed(() => members.value.length)

  const generateCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const fetchMyFamily = async () => {
    const userId = authStore.getUserId()
    if (!userId) return

    loading.value = true

    try {
      // 내가 속한 family_members 조회
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', userId)
        .single()

      if (memberError || !memberData) {
        family.value = null
        members.value = []
        loading.value = false
        return
      }

      // family 정보 조회
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', memberData.family_id)
        .single()

      if (familyError || !familyData) {
        family.value = null
        members.value = []
        loading.value = false
        return
      }

      family.value = familyData

      // 생성자인 경우: 기존 데이터(user_id로 저장된)를 패밀리 코드로 마이그레이션
      if (familyData.created_by === userId) {
        await supabase.from('ledgers').update({ family_code: familyData.code }).eq('family_code', userId)
        await supabase.from('tags').update({ family_code: familyData.code }).eq('family_code', userId)
      }

      // 가족 구성원 조회
      await fetchMembers(familyData.id)
    } catch (e) {
      console.error('가족 정보 조회 오류:', e)
    }

    loading.value = false
  }

  const fetchMembers = async (familyId: string) => {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .order('joined_at', { ascending: true })

    if (!error && data) {
      members.value = data
    }
  }

  const createFamily = async (): Promise<string | null> => {
    const userId = authStore.getUserId()
    const user = authStore.user
    if (!userId || !user) return null

    loading.value = true

    try {
      // 이미 가족이 있으면 기존 코드 반환
      if (family.value) {
        loading.value = false
        return family.value.code
      }

      // 새 코드 생성 (중복 체크)
      let code = generateCode()
      let attempts = 0
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from('families')
          .select('id')
          .eq('code', code)
          .single()

        if (!existing) break
        code = generateCode()
        attempts++
      }

      // families 테이블에 생성
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert({
          code,
          created_by: userId,
        })
        .select()
        .single()

      if (familyError || !newFamily) {
        console.error('가족 생성 오류:', familyError)
        loading.value = false
        return null
      }

      // family_members에 본인 추가
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: newFamily.id,
          user_id: userId,
          nickname: user.properties?.nickname || null,
          profile_image: user.properties?.profile_image || null,
        })

      if (memberError) {
        console.error('멤버 추가 오류:', memberError)
        loading.value = false
        return null
      }

      // 기존 데이터를 새 패밀리 코드로 마이그레이션 (ledgers, tags)
      await supabase.from('ledgers').update({ family_code: code }).eq('family_code', userId)
      await supabase.from('tags').update({ family_code: code }).eq('family_code', userId)

      family.value = newFamily
      await fetchMembers(newFamily.id)
      loading.value = false
      return code
    } catch (e) {
      console.error('가족 생성 오류:', e)
      loading.value = false
      return null
    }
  }

  const joinFamily = async (code: string): Promise<{ success: boolean; message: string }> => {
    const userId = authStore.getUserId()
    const user = authStore.user
    if (!userId || !user) {
      return { success: false, message: '로그인이 필요합니다.' }
    }

    loading.value = true

    try {
      // 이미 가족이 있으면 먼저 탈퇴
      if (family.value) {
        await leaveFamily()
      }

      // 코드로 가족 찾기
      const { data: targetFamily, error: findError } = await supabase
        .from('families')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (findError || !targetFamily) {
        loading.value = false
        return { success: false, message: '존재하지 않는 코드입니다.' }
      }

      // 이미 해당 가족의 멤버인지 확인
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', targetFamily.id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        family.value = targetFamily
        await fetchMembers(targetFamily.id)
        loading.value = false
        return { success: true, message: '이미 참여 중인 가족입니다.' }
      }

      // 가족에 참여
      const { error: joinError } = await supabase
        .from('family_members')
        .insert({
          family_id: targetFamily.id,
          user_id: userId,
          nickname: user.properties?.nickname || null,
          profile_image: user.properties?.profile_image || null,
        })

      if (joinError) {
        console.error('가족 참여 오류:', joinError)
        loading.value = false
        return { success: false, message: '참여에 실패했습니다.' }
      }

      family.value = targetFamily
      await fetchMembers(targetFamily.id)
      loading.value = false
      return { success: true, message: '가족에 참여했습니다!' }
    } catch (e) {
      console.error('가족 참여 오류:', e)
      loading.value = false
      return { success: false, message: '오류가 발생했습니다.' }
    }
  }

  const leaveFamily = async (): Promise<boolean> => {
    const userId = authStore.getUserId()
    if (!userId || !family.value) return false

    loading.value = true

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', family.value.id)
        .eq('user_id', userId)

      if (error) {
        console.error('가족 탈퇴 오류:', error)
        loading.value = false
        return false
      }

      family.value = null
      members.value = []
      loading.value = false
      return true
    } catch (e) {
      console.error('가족 탈퇴 오류:', e)
      loading.value = false
      return false
    }
  }

  return {
    family,
    members,
    loading,
    isInFamily,
    familyCode,
    memberCount,
    fetchMyFamily,
    createFamily,
    joinFamily,
    leaveFamily,
  }
})
