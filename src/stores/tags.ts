import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

export interface Tag {
  id: string
  name: string
  color: string
}

const DEFAULT_TAGS: Omit<Tag, 'id'>[] = [
  { name: '결혼', color: '#F43F5E' },
  { name: '장례', color: '#64748B' },
  { name: '돌잔치', color: '#F97316' },
  { name: '생일', color: '#8B5CF6' },
  { name: '출산', color: '#EC4899' },
  { name: '기타', color: '#94A3B8' },
]

const getFamilyCode = () => {
  const authStore = useAuthStore()
  return authStore.getUserId() || 'SINGLE_USER'
}

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  const fetchTags = async () => {
    loading.value = true
    const familyCode = getFamilyCode()
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, color')
      .eq('family_code', familyCode)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('태그 로드 오류:', error.message)
      loading.value = false
      return
    }

    if (data && data.length > 0) {
      tags.value = data
    } else {
      await initDefaultTags()
    }
    loading.value = false
  }

  const initDefaultTags = async () => {
    const familyCode = getFamilyCode()
    const insertData = DEFAULT_TAGS.map((tag) => ({
      ...tag,
      family_code: familyCode,
    }))

    const { data, error } = await supabase
      .from('tags')
      .insert(insertData)
      .select('id, name, color')

    if (error) {
      console.error('기본 태그 생성 오류:', error.message)
      tags.value = DEFAULT_TAGS.map((t, i) => ({ ...t, id: `default-${i}` }))
      return
    }

    tags.value = data || []
  }

  const addTag = async (name: string, color: string) => {
    const familyCode = getFamilyCode()
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, color, family_code: familyCode })
      .select('id, name, color')
      .single()

    if (error) {
      alert(`태그 추가 오류: ${error.message}`)
      return
    }

    tags.value.push(data)
  }

  const deleteTag = async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) {
      alert(`태그 삭제 오류: ${error.message}`)
      return
    }
    tags.value = tags.value.filter((t) => t.id !== id)
  }

  return {
    tags,
    loading,
    fetchTags,
    addTag,
    deleteTag,
  }
})
