<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CalendarDays, Filter, PlusCircle, Trash2 } from 'lucide-vue-next'
import { useLedgerStore } from '../stores/ledger'
import LedgerAddModal from '../components/LedgerAddModal.vue'

const ledger = useLedgerStore()
const showAdd = ref(false)

onMounted(() => {
  ledger.fetchAll()
})

const openAdd = () => {
  showAdd.value = true
}

const handleSubmit = (payload: {
  date: string
  personName: string
  type: 'IN' | 'OUT'
  amount: number
  tag: string
  memo: string
}) => {
  ledger.addItem(payload)
}

const handleDelete = (id: string) => {
  if (!confirm('이 내역을 삭제하시겠습니까?')) return
  ledger.deleteItem(id)
}
</script>

<template>
  <div class="space-y-4">
    <section class="flex items-center justify-between">
      <div>
        <p class="text-[11px] font-medium text-slate-500">2026년 2월</p>
        <p class="mt-1 text-[16px] font-semibold text-slate-900">이번 달 경조사 요약</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600"
      >
        <CalendarDays class="w-3.5 h-3.5" />
        캘린더
      </button>
    </section>

    <section class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 flex justify-between text-[12px]">
      <div>
        <p class="text-slate-500">총 입금</p>
        <p class="mt-1 text-[15px] font-semibold text-emerald-600">
          {{ ledger.totalIn.toLocaleString() }}
          <span class="ml-0.5 text-[11px] font-normal text-slate-500">원</span>
        </p>
      </div>
      <div class="text-right">
        <p class="text-slate-500">총 출금</p>
        <p class="mt-1 text-[15px] font-semibold text-rose-600">
          {{ ledger.totalOut.toLocaleString() }}
          <span class="ml-0.5 text-[11px] font-normal text-slate-500">원</span>
        </p>
      </div>
    </section>

    <section class="flex items-center justify-between">
      <p class="text-[12px] font-medium text-slate-700">최근 경조사 내역</p>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600"
      >
        <Filter class="w-3.5 h-3.5" />
        필터
      </button>
    </section>

    <section class="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
      <article
        v-for="item in ledger.items"
        :key="item.id"
        class="flex items-center justify-between px-3.5 py-2.5"
      >
        <div class="min-w-0">
          <p class="text-[13px] font-semibold text-slate-900 truncate">
            {{ item.personName }}
            <span
              class="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {{ item.tag }}
            </span>
          </p>
          <p class="mt-0.5 text-[11px] text-slate-400">
            {{ item.date }} ·
            <span>{{ item.type === 'IN' ? '받음' : '보냄' }}</span>
          </p>
          <p v-if="item.memo" class="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
            {{ item.memo }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <p
            class="text-[14px] font-semibold"
            :class="item.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'"
          >
            <span>{{ item.type === 'IN' ? '+' : '-' }}</span>
            {{ item.amount.toLocaleString() }}
          </p>
          <button
            type="button"
            class="ml-1 p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50"
            @click="handleDelete(item.id)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </article>
    </section>

    <div class="flex justify-end">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full bg-[#00C300] text-white text-[13px] font-semibold px-4 h-9"
        @click="openAdd"
      >
        <PlusCircle class="w-4 h-4" />
        새 내역 추가
      </button>
    </div>

    <LedgerAddModal
      v-if="showAdd"
      @close="showAdd = false"
      @submit="handleSubmit"
    />
  </div>
</template>

