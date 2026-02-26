import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '../supabase'

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
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalIn = computed(() =>
    items.value.filter((d) => d.type === 'IN').reduce((s, d) => s + d.amount, 0),
  )
  const totalOut = computed(() =>
    items.value.filter((d) => d.type === 'OUT').reduce((s, d) => s + d.amount, 0),
  )

  const FAMILY_CODE = 'SINGLE_USER'

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('ledgers')
      .select('id, date, amount, type, tag, person_name, memo')
      .eq('family_code', FAMILY_CODE)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

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
    const { data, error: err } = await supabase
      .from('ledgers')
      .insert({
        date: payload.date,
        amount: payload.amount,
        type: payload.type,
        tag: payload.tag,
        person_name: payload.personName,
        memo: payload.memo,
        family_code: FAMILY_CODE,
      })
      .select('id, date, amount, type, tag, person_name, memo')
      .single()

    if (err) {
      // 단순 알림만 (UX는 추후 개선)
      alert(`내역 저장 중 오류가 발생했습니다: ${err.message}`)
      return
    }

    items.value.unshift({
      id: data.id,
      date: data.date,
      amount: data.amount,
      type: data.type,
      tag: data.tag,
      personName: data.person_name,
      memo: data.memo ?? '',
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

  return {
    items,
    loading,
    error,
    totalIn,
    totalOut,
    fetchAll,
    addItem,
    deleteItem,
  }
})

