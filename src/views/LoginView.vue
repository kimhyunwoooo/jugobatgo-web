<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleKakaoLogin = async () => {
  const success = await authStore.signInWithKakao()
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- 로고 영역 -->
      <div class="text-center mb-8">
        <img
          src="/icon-192x192.png"
          alt="주고받고"
          class="w-[72px] h-[72px] rounded-3xl mx-auto mb-4"
        />
        <h1 class="text-[22px] font-bold text-slate-900">주고받고</h1>
        <p class="text-[14px] text-slate-500 mt-1">가족 경조사 내역을 함께 관리해요</p>
      </div>

      <!-- 로그인 버튼 -->
      <div class="space-y-3">
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 h-[52px] rounded-xl text-[15px] font-semibold transition-colors"
          style="background-color: #FEE500; color: #000000;"
          @click="handleKakaoLogin"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 3C5.58172 3 2 5.79086 2 9.2C2 11.3894 3.38553 13.3141 5.5 14.4L4.5 17.5C4.44772 17.6761 4.55228 17.8522 4.72839 17.9045C4.81644 17.9307 4.91156 17.9188 4.99 17.8714L8.5 15.5C8.99114 15.5662 9.49182 15.6 10 15.6C14.4183 15.6 18 12.8091 18 9.2C18 5.79086 14.4183 3 10 3Z" fill="black"/>
          </svg>
          카카오로 시작하기
        </button>
      </div>

      <!-- 하단 설명 -->
      <p class="text-center text-[12px] text-slate-400 mt-8">
        로그인하면 가족 구성원들과 함께<br />
        경조사 내역을 공유하고 관리할 수 있습니다.
      </p>
    </div>
  </div>
</template>
