<script setup lang="ts">
import { ref } from 'vue'
import { useFamilyStore } from '../stores/family'
import { Link2, Users, Sparkles } from 'lucide-vue-next'

const family = useFamilyStore()

const mode = ref<'create' | 'join'>('create')
const code = ref('')
const nickname = ref('')

const submit = () => {
  if (!code.value.trim()) {
    alert('가족 코드를 입력해주세요.')
    return
  }

  family.setFamily(code.value, nickname.value)
  alert(`가족 코드가 설정되었습니다: ${family.rawCode}`)
}
</script>

<template>
  <div class="space-y-5">
    <section>
      <h2 class="text-[17px] font-semibold text-slate-900">
        가족 코드 설정
      </h2>
      <p class="mt-1 text-[13px] text-slate-600 leading-relaxed">
        같은 가족 코드를 사용하는 모든 계정은
        <span class="font-semibold text-slate-800">동일한 경조사 내역</span>을 함께 보게 됩니다.
      </p>
    </section>

    <section class="space-y-3">
      <div class="inline-flex rounded-full bg-slate-100 p-1 text-[11px] font-medium text-slate-600">
        <button
          class="flex-1 px-3 py-1.5 rounded-full inline-flex items-center justify-center gap-1.5"
          :class="mode === 'create' ? 'bg-white text-slate-900' : 'text-slate-500'"
          type="button"
          @click="mode = 'create'"
        >
          <Sparkles class="w-3.5 h-3.5" />
          새 코드 만들기
        </button>
        <button
          class="flex-1 px-3 py-1.5 rounded-full inline-flex items-center justify-center gap-1.5"
          :class="mode === 'join' ? 'bg-white text-slate-900' : 'text-slate-500'"
          type="button"
          @click="mode = 'join'"
        >
          <Users class="w-3.5 h-3.5" />
          코드에 참여하기
        </button>
      </div>

      <form class="space-y-3" @submit.prevent="submit">
        <label class="block text-[12px] font-medium text-slate-700">
          가족 코드
          <div
            class="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
          >
            <Link2 class="w-4 h-4 text-slate-400" />
            <input
              v-model="code"
              type="text"
              inputmode="text"
              class="flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-300"
              :placeholder="mode === 'create' ? '예: JGBG-FAMILY-01' : '배우자가 알려준 코드 입력'"
            />
          </div>
        </label>

        <label class="block text-[12px] font-medium text-slate-700">
          내 별명 (선택)
          <div
            class="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
          >
            <input
              v-model="nickname"
              type="text"
              class="flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-300"
              placeholder="예: 남편, 아내, 김OO"
            />
          </div>
        </label>

        <button
          type="submit"
          class="mt-1 w-full inline-flex items-center justify-center rounded-full bg-[#00C300] text-white text-[14px] font-semibold h-11"
        >
          {{ mode === 'create' ? '가족 코드 생성 및 저장' : '이 가족 코드에 참여하기' }}
        </button>
      </form>
    </section>
  </div>
</template>

