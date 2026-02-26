<script setup lang="ts">
import { ref } from 'vue'
import type { LedgerType } from '../stores/ledger'
import { X } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: {
    date: string
    personName: string
    type: LedgerType
    amount: number
    tag: string
    memo: string
  }): void
}>()

const today = new Date().toISOString().slice(0, 10)

const date = ref(today)
const personName = ref('')
const type = ref<LedgerType>('OUT')
const amount = ref('')
const tag = ref('')
const memo = ref('')

const onSubmit = () => {
  const parsedAmount = Number(amount.value.replace(/,/g, ''))
  if (!personName.value.trim() || !parsedAmount) {
    alert('이름과 금액을 입력해주세요.')
    return
  }

  emit('submit', {
    date: date.value,
    personName: personName.value.trim(),
    type: type.value,
    amount: parsedAmount,
    tag: tag.value.trim() || '기타',
    memo: memo.value.trim(),
  })
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
    <div class="w-full max-w-md mx-4 rounded-2xl bg-white shadow-lg">
      <header class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 class="text-[15px] font-semibold text-slate-900">새 경조사 내역 추가</h2>
        <button type="button" class="p-1 text-slate-400" @click="emit('close')">
          <X class="w-4 h-4" />
        </button>
      </header>

      <form class="px-4 py-3 space-y-3" @submit.prevent="onSubmit">
        <div class="flex gap-2">
          <label class="flex-1 text-[12px] font-medium text-slate-700">
            날짜
            <input
              v-model="date"
              type="date"
              class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none"
            />
          </label>
          <label class="flex-1 text-[12px] font-medium text-slate-700">
            유형
            <div class="mt-1 flex h-[34px] rounded-full bg-slate-100 p-0.5 text-[11px]">
              <button
                type="button"
                class="flex-1 rounded-full"
                :class="type === 'IN' ? 'bg-white text-emerald-600 font-semibold' : 'text-slate-500'"
                @click="type = 'IN'"
              >
                입금
              </button>
              <button
                type="button"
                class="flex-1 rounded-full"
                :class="type === 'OUT' ? 'bg-white text-rose-600 font-semibold' : 'text-slate-500'"
                @click="type = 'OUT'"
              >
                출금
              </button>
            </div>
          </label>
        </div>

        <label class="block text-[12px] font-medium text-slate-700">
          이름 / 관계
          <input
            v-model="personName"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none placeholder:text-slate-300"
            placeholder="예: 김지은 사촌"
          />
        </label>

        <div class="flex gap-2">
          <label class="flex-1 text-[12px] font-medium text-slate-700">
            금액
            <input
              v-model="amount"
              inputmode="numeric"
              class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none placeholder:text-slate-300"
              placeholder="예: 50000"
            />
          </label>
          <label class="flex-1 text-[12px] font-medium text-slate-700">
            태그
            <input
              v-model="tag"
              type="text"
              class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none placeholder:text-slate-300"
              placeholder="예: 결혼, 장례, 돌잔치"
            />
          </label>
        </div>

        <label class="block text-[12px] font-medium text-slate-700">
          메모 (선택)
          <textarea
            v-model="memo"
            rows="2"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none placeholder:text-slate-300 resize-none"
            placeholder="예: 축의금, 조의금, 현금 / 계좌이체 등"
          />
        </label>

        <div class="pt-1 pb-2 flex justify-end gap-2 text-[13px]">
          <button
            type="button"
            class="px-3 h-9 rounded-full border border-slate-200 text-slate-600 bg-white"
            @click="emit('close')"
          >
            취소
          </button>
          <button
            type="submit"
            class="px-4 h-9 rounded-full bg-[#00C300] text-white font-semibold"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

