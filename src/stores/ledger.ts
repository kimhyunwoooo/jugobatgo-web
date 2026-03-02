import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'
import { useFamilyStore } from './family'

export type LedgerType = 'IN' | 'OUT'

export interface LedgerItem {
  id: string
  date: string // YYYY-MM-DD
  personName: string
  type: LedgerType
  amount: number
  tag: string
  memo?: string
}

export const useLedgerStore = defineStore('ledger', () => {
  const items = ref<LedgerItem[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const totalIn = computed(() =>
    items.value.filter((d) => d.type === 'IN').reduce((s, d) => s + d.amount, 0),
  )
  const totalOut = computed(() =>
    items.value.filter((d) => d.type === 'OUT').reduce((s, d) => s + d.amount, 0),
  )

  const getFamilyCode = () => {
    const familyStore = useFamilyStore()
    // 가족이 있으면 가족 코드 사용, 없으면 개인 ID
    if (familyStore.familyCode) {
      return familyStore.familyCode
    }
    const authStore = useAuthStore()
    return authStore.getUserId() || 'SINGLE_USER'
  }

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    const familyCode = getFamilyCode()
    const { data, error: err } = await supabase
      .from('ledgers')
      .select('id, date, amount, type, tag, person_name, memo')
      .eq('family_code', familyCode)
      .order('date', { ascending: false })
      .order('amount', { ascending: false })

    if (err) {
      error.value = err.message
      loading.value = false
      return
    }

    items.value = (data ?? []).map((row: any) => ({
      id: row.id,
      date: row.date,
      amount: row.amount,
      type: row.type,
      tag: row.tag,
      personName: row.person_name,
      memo: row.memo ?? '',
    }))
    loading.value = false
  }

  const addItem = async (payload: Omit<LedgerItem, 'id'>) => {
    const familyCode = getFamilyCode()
    const { data, error: err } = await supabase
      .from('ledgers')
      .insert({
        date: payload.date,
        amount: payload.amount,
        type: payload.type,
        tag: payload.tag,
        person_name: payload.personName,
        memo: payload.memo,
        family_code: familyCode,
      })
      .select('id, date, amount, type, tag, person_name, memo')
      .single()

    if (err) {
      // 단순 알림만 (UX는 추후 개선)
      alert(`내역 저장 중 오류가 발생했습니다: ${err.message}`)
      return
    }

    items.value.push({
      id: data.id,
      date: data.date,
      amount: data.amount,
      type: data.type,
      tag: data.tag,
      personName: data.person_name,
      memo: data.memo ?? '',
    })
    // 날짜 내림차순, 같은 날은 금액 내림차순
    items.value.sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date)
      return dateCmp !== 0 ? dateCmp : b.amount - a.amount
    })
  }

  const deleteItem = async (id: string) => {
    const prev = [...items.value]
    items.value = items.value.filter((item) => item.id !== id)

    const { error: err } = await supabase.from('ledgers').delete().eq('id', id)
    if (err) {
      alert(`내역 삭제 중 오류가 발생했습니다: ${err.message}`)
      items.value = prev
    }
  }

  const updateItem = async (id: string, payload: Omit<LedgerItem, 'id'>) => {
    const { data, error: err } = await supabase
      .from('ledgers')
      .update({
        date: payload.date,
        amount: payload.amount,
        type: payload.type,
        tag: payload.tag,
        person_name: payload.personName,
        memo: payload.memo,
      })
      .eq('id', id)
      .select('id, date, amount, type, tag, person_name, memo')
      .single()

    if (err) {
      alert(`내역 수정 중 오류가 발생했습니다: ${err.message}`)
      return
    }

    const index = items.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      items.value[index] = {
        id: data.id,
        date: data.date,
        amount: data.amount,
        type: data.type,
        tag: data.tag,
        personName: data.person_name,
        memo: data.memo ?? '',
      }
      // 날짜 내림차순, 같은 날은 금액 내림차순
      items.value.sort((a, b) => {
        const dateCmp = b.date.localeCompare(a.date)
        return dateCmp !== 0 ? dateCmp : b.amount - a.amount
      })
    }
  }

  return {
    items,
    loading,
    error,
    totalIn,
    totalOut,
    fetchAll,
    addItem,
    deleteItem,
    updateItem,
  }
})

