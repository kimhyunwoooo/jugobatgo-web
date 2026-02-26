<script setup lang="ts">
import { Loader2, LogIn } from 'lucide-vue-next'
import { ref } from 'vue'
import { supabase } from '../supabase'

const loading = ref(false)

const signInWithGoogle = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const redirectTo =
      (import.meta.env.VITE_SITE_URL as string | undefined) ??
      (window.location.origin + window.location.pathname)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error('[Supabase] Google 로그인 실패:', error.message)
      alert('구글 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    type="button"
    class="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#00C300] text-white text-[14px] font-semibold h-11 active:scale-[0.98] transition-all duration-150"
    @click="signInWithGoogle"
  >
    <span
      class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 border border-white/30"
    >
      <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
      <LogIn v-else class="h-4 w-4" />
    </span>
    <span>Google 계정으로 시작하기</span>
  </button>
</template>

