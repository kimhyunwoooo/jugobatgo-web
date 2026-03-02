<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useFamilyStore } from './stores/family'

const authStore = useAuthStore()
const familyStore = useFamilyStore()

onMounted(() => {
  authStore.initialize()
})

// 로그인 후 가족 정보 불러오기
watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    familyStore.fetchMyFamily()
  }
}, { immediate: true })
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="text-center">
      <img
        src="/icon-192x192.png"
        alt="주고받고"
        class="w-[60px] h-[60px] rounded-2xl mb-3 animate-pulse"
      />
      <p class="text-[14px] text-slate-500">로딩 중...</p>
    </div>
  </div>
  <router-view v-else />
</template>
