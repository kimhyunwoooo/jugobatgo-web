<script setup lang="ts">
import { computed } from 'vue'
import LedgerMainView from './views/LedgerMainView.vue'

const title = computed(() => '가족 경조사 내역')
const subtitle = computed(() => '이번 달 경조사비 흐름을 함께 봅니다.')
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- 상단 앱바 (LINE 스타일) -->
    <header class="h-12 flex items-center justify-between px-4 border-b border-slate-100 bg-white">
      <div class="flex items-center gap-2">
        <div class="h-7 w-7 rounded-2xl bg-[#00C300] flex items-center justify-center text-white text-[11px] font-semibold">
          家
        </div>
        <div class="leading-tight">
          <p class="text-[10px] text-slate-500">주고받고 · JGBG</p>
          <p class="text-[13px] font-semibold text-slate-900">
            {{ title }}
          </p>
        </div>
      </div>
      <span class="text-[11px] text-slate-400">내역</span>
    </header>

    <!-- 본문 컨테이너 -->
    <main class="max-w-md mx-auto px-4 py-4">
      <section class="bg-white rounded-2xl border border-slate-100 px-4 py-4">
        <p class="text-[11px] text-slate-500 mb-1">
          {{ subtitle }}
        </p>

        <LedgerMainView />
      </section>

      <footer class="mt-4 flex items-center justify-between text-[11px] text-slate-400">
        <div>주고받고 · 부부 공동 경조사비</div>
      </footer>
    </main>
  </div>
</template>
