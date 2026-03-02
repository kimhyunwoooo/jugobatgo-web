<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { LedgerType, LedgerItem } from '../stores/ledger'
import { useTagsStore } from '../stores/tags'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  editItem?: LedgerItem | null
}>()

const tagsStore = useTagsStore()

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
  (e: 'update', data: { id: string, payload: {
    date: string
    personName: string
    type: LedgerType
    amount: number
    tag: string
    memo: string
  }}): void
}>()

const today = new Date().toISOString().slice(0, 10)

const date = ref(today)
const personName = ref('')
const type = ref<LedgerType>('OUT')
const amount = ref('')
const tag = ref('')
const memo = ref('')

const isEditMode = ref(false)

onMounted(() => {
  if (props.editItem) {
    isEditMode.value = true
    date.value = props.editItem.date
    personName.value = props.editItem.personName
    type.value = props.editItem.type
    amount.value = String(props.editItem.amount)
    tag.value = props.editItem.tag
    memo.value = props.editItem.memo || ''
  }
})

const onSubmit = () => {
  const parsedAmount = Number(amount.value.replace(/,/g, ''))
  if (!date.value) {
    alert('날짜를 입력해주세요.')
    return
  }
  if (!personName.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }
  if (!parsedAmount) {
    alert('금액을 입력해주세요.')
    return
  }

  const payload = {
    date: date.value,
    personName: personName.value.trim(),
    type: type.value,
    amount: parsedAmount,
    tag: tag.value.trim() || '기타',
    memo: memo.value.trim(),
  }

  if (isEditMode.value && props.editItem) {
    emit('update', { id: props.editItem.id, payload })
  } else {
    emit('submit', payload)
  }
  emit('close')
}
</script>

<template>
  <div class="fixed top-0 left-0 right-0 bottom-0 z-30 flex items-center justify-center bg-black/40 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
      <header class="flex items-center justify-between px-4 py-[13px] border-b border-slate-100">
        <h2 class="text-[16px] font-semibold text-slate-900">
          {{ isEditMode ? '경조사 내역 수정' : '새 경조사 내역 추가' }}
        </h2>
        <button type="button" class="p-[4px] text-slate-400" @click="emit('close')">
          <X class="w-[18px] h-[18px]" />
        </button>
      </header>

      <form class="px-4 py-[13px] space-y-[13px]" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-[0.5rem]">
          <label class="min-w-0 text-[13px] font-medium text-slate-700">
            날짜
            <input
              v-model="date"
              type="date"
              class="mt-1 w-full h-[40px] min-h-[40px] rounded-lg border border-slate-200 bg-slate-50 px-[13px] text-[14px] outline-none [&::-webkit-date-and-time-value]:text-left"
            />
          </label>
          <label class="min-w-0 text-[13px] font-medium text-slate-700">
            유형
            <div class="mt-1 flex h-[40px] rounded-full bg-slate-100 p-[2px] text-[13px]">
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

        <label class="block text-[13px] font-medium text-slate-700">
          이름
          <input
            v-model="personName"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-[13px] py-[9px] text-[14px] outline-none placeholder:text-slate-300"
            placeholder="예: 김현우"
          />
        </label>

        <label class="block text-[13px] font-medium text-slate-700">
          금액
          <input
            v-model="amount"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-[13px] py-[9px] text-[14px] outline-none placeholder:text-slate-300"
            placeholder="예: 50000"
            @input="amount = amount.replace(/[^0-9]/g, '')"
          />
        </label>

        <div class="text-[13px] font-medium text-slate-700">
          태그
          <div class="mt-1 flex flex-wrap gap-[6px]">
            <button
              v-for="t in tagsStore.tags"
              :key="t.id"
              type="button"
              class="px-[13px] py-[6px] rounded-full text-[12px] font-medium transition-colors"
              :class="tag === t.name
                ? 'text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              :style="tag === t.name ? { backgroundColor: t.color } : {}"
              @click="tag = t.name"
            >
              {{ t.name }}
            </button>
          </div>
        </div>

        <label class="block text-[13px] font-medium text-slate-700">
          메모 (선택)
          <textarea
            v-model="memo"
            rows="2"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-[13px] py-[9px] text-[14px] outline-none placeholder:text-slate-300 resize-none"
            placeholder="예: 축의금, 조의금, 현금 / 계좌이체 등"
          />
        </label>

        <div class="pt-1 pb-2 flex justify-end gap-2 text-[14px]">
          <button
            type="button"
            class="px-[13px] h-[38px] rounded-full border border-slate-200 text-slate-600 bg-white"
            @click="emit('close')"
          >
            취소
          </button>
          <button
            type="submit"
            class="px-[17px] h-[38px] rounded-full bg-[#00C300] text-white font-semibold"
          >
            {{ isEditMode ? '수정' : '저장' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
button {
  transition: all 0.15s ease;
}

button:active {
  transform: scale(0.97);
}

input, textarea {
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input:focus, textarea:focus {
  border-color: #00C300;
  box-shadow: 0 0 0 2px rgba(0, 195, 0, 0.1);
}

/* iOS date input 높이 통일 */
input[type="date"] {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  line-height: 1.2;
}
</style>
