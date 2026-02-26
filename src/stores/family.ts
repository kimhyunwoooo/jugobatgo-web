import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type FamilyCode = string

export const useFamilyStore = defineStore('family', () => {
  const rawCode = ref<FamilyCode | null>(null)
  const nickname = ref<string | null>(null)

  const hasFamily = computed(() => !!rawCode.value)

  const setFamily = (code: FamilyCode, name?: string) => {
    rawCode.value = code.trim()
    nickname.value = name?.trim() || nickname.value
  }

  const resetFamily = () => {
    rawCode.value = null
    nickname.value = null
  }

  return {
    rawCode,
    nickname,
    hasFamily,
    setFamily,
    resetFamily,
  }
})

