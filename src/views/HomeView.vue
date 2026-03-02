<script setup lang="ts">
import { computed, ref, Transition } from 'vue'
import { useRouter } from 'vue-router'
import { Search, X, LogOut, Settings } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import LedgerMainView from './LedgerMainView.vue'
import SettingsModal from '../components/SettingsModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const title = computed(() => '가족 경조사 내역')
const subtitle = computed(() => '이번 달 경조사비 흐름을 함께 봅니다.')

const userNickname = computed(() => authStore.user?.properties?.nickname || '사용자')
const userProfileImage = computed(() => authStore.user?.properties?.profile_image || null)

const showSearch = ref(false)
const showSettings = ref(false)
const searchQuery = ref('')

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const handleLogout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    await authStore.signOut()
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- 상단 앱바 (LINE 스타일) -->
    <header class="h-[52px] flex items-center justify-between px-4 border-b border-slate-100 bg-white">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="relative rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-300"
          @click="showSettings = true"
        >
          <img
            v-if="userProfileImage"
            :src="userProfileImage"
            alt="프로필"
            class="h-[30px] w-[30px] rounded-full object-cover"
          />
          <div
            v-else
            class="h-[30px] w-[30px] rounded-full bg-[#00C300] flex items-center justify-center text-white text-[12px] font-semibold"
          >
            家
          </div>
          <span class="absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] rounded-full bg-white border border-slate-200 flex items-center justify-center">
            <Settings class="w-[9px] h-[9px] text-slate-500" />
          </span>
        </button>
        <div v-if="!showSearch" class="leading-tight">
          <p class="text-[11px] text-slate-500">주고받고 - {{ userNickname }}</p>
          <p class="text-[14px] font-semibold text-slate-900">
            {{ title }}
          </p>
        </div>
        <!-- 검색 입력창 -->
        <div v-else class="flex-1 flex items-center gap-2 ml-1">
          <input
            v-model="searchQuery"
            type="text"
            class="flex-1 h-[34px] px-3 rounded-full bg-slate-100 text-[14px] outline-none placeholder:text-slate-400"
            placeholder="이름으로 검색..."
            autofocus
          />
          <button
            v-if="searchQuery"
            type="button"
            class="p-1 text-slate-400 hover:text-slate-600"
            @click="clearSearch"
          >
            <X class="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="p-[6px] rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          @click="toggleSearch"
        >
          <Search v-if="!showSearch" class="w-[22px] h-[22px]" />
          <X v-else class="w-[22px] h-[22px]" />
        </button>
        <button
          type="button"
          class="p-[6px] rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          @click="handleLogout"
          title="로그아웃"
        >
          <LogOut class="w-[20px] h-[20px]" />
        </button>
      </div>
    </header>

    <!-- 본문 컨테이너 -->
    <main class="max-w-[49rem] mx-auto px-2 py-2">
      <section class="bg-white rounded-2xl border border-slate-100 px-2 py-2">
        <p class="text-[12px] text-slate-500 mb-1">
          {{ subtitle }}
        </p>

        <LedgerMainView :searchQuery="searchQuery" />
      </section>

      <footer class="mt-4 flex items-center justify-between text-[12px] text-slate-400">
        <div>주고받고 · 부부 공동 경조사비</div>
      </footer>
    </main>

    <!-- 설정 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <SettingsModal
          v-if="showSettings"
          @close="showSettings = false"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
