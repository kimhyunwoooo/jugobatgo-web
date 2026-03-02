<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-[#00C300] text-white text-[22px] font-bold mb-3 animate-pulse">
        家
      </div>
      <p class="text-[14px] text-slate-500">로딩 중...</p>
    </div>
  </div>
  <router-view v-else />
</template>
