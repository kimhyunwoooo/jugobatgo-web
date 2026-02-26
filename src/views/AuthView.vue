<script setup lang="ts">
import GoogleSignInButton from '../components/GoogleSignInButton.vue'
</script>

<template>
  <div class="space-y-5">
    <section>
      <h2 class="text-[17px] font-semibold text-slate-900">
        Google 계정으로 시작하기
      </h2>
      <p class="mt-1 text-[13px] text-slate-600 leading-relaxed">
        하나의 계정으로 로그인한 뒤,
        <span class="font-semibold text-slate-800">가족 코드</span>를 통해
        배우자와 같은 경조사 내역을 함께 관리합니다.
      </p>
    </section>

    <section class="space-y-3">
      <GoogleSignInButton />
      <p class="text-[11px] text-slate-400 leading-relaxed">
        로그인 시 Supabase를 통해 계정이 생성되며,
        이후 단계에서 가족 코드를 만들거나
        <span class="font-medium text-slate-500">배우자의 코드에 참여</span>할 수 있습니다.
      </p>
    </section>
  </div>
</template>

