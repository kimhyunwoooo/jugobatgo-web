<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, Copy, Check, UserPlus, LogOut, Users } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useFamilyStore } from '../stores/family'

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const familyStore = useFamilyStore()

const joinCode = ref('')
const copied = ref(false)
const joinMessage = ref('')
const joinError = ref(false)

onMounted(() => {
  familyStore.fetchMyFamily()
})

const handleCreateFamily = async () => {
  const code = await familyStore.createFamily()
  if (code) {
    joinMessage.value = '패밀리 코드가 생성되었습니다!'
    joinError.value = false
  }
}

const handleJoinFamily = async () => {
  if (!joinCode.value.trim()) {
    joinMessage.value = '코드를 입력해주세요.'
    joinError.value = true
    return
  }

  const result = await familyStore.joinFamily(joinCode.value.trim())
  joinMessage.value = result.message
  joinError.value = !result.success

  if (result.success) {
    joinCode.value = ''
  }
}

const handleLeaveFamily = async () => {
  if (!confirm('정말 가족에서 나가시겠습니까?\n데이터는 유지되며, 같은 코드로 다시 참여할 수 있습니다.')) {
    return
  }

  const success = await familyStore.leaveFamily()
  if (success) {
    joinMessage.value = '가족에서 나갔습니다.'
    joinError.value = false
  }
}

const copyCode = async () => {
  if (!familyStore.familyCode) return

  try {
    await navigator.clipboard.writeText(familyStore.familyCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    alert('복사에 실패했습니다.')
  }
}
</script>

<template>
  <div class="fixed top-0 left-0 right-0 bottom-0 z-30 flex items-center justify-center bg-black/40 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
      <!-- 헤더 -->
      <header class="flex items-center justify-between px-4 py-[13px] border-b border-slate-100">
        <h2 class="text-[16px] font-semibold text-slate-900">설정</h2>
        <button
          type="button"
          class="p-1 rounded-full text-slate-400 hover:bg-slate-100"
          @click="emit('close')"
        >
          <X class="w-[20px] h-[20px]" />
        </button>
      </header>

      <div class="p-4 space-y-5">
        <!-- 프로필 정보 -->
        <section class="flex items-center gap-3">
          <img
            v-if="authStore.user?.properties?.profile_image"
            :src="authStore.user.properties.profile_image"
            alt="프로필"
            class="w-[48px] h-[48px] rounded-full object-cover"
          />
          <div
            v-else
            class="w-[48px] h-[48px] rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[18px]"
          >
            ?
          </div>
          <div>
            <p class="text-[15px] font-semibold text-slate-900">
              {{ authStore.user?.properties?.nickname || '사용자' }}
            </p>
            <p class="text-[12px] text-slate-400">카카오 로그인</p>
          </div>
        </section>

        <!-- 가족 연결 섹션 -->
        <section class="border-t border-slate-100 pt-4">
          <div class="flex items-center gap-2 mb-3">
            <Users class="w-[18px] h-[18px] text-slate-500" />
            <h3 class="text-[14px] font-semibold text-slate-700">가족 연결</h3>
          </div>

          <!-- 가족이 있는 경우 -->
          <div v-if="familyStore.isInFamily" class="space-y-3">
            <!-- 패밀리 코드 -->
            <div class="bg-slate-50 rounded-xl p-3">
              <p class="text-[11px] text-slate-500 mb-1">패밀리 코드</p>
              <div class="flex items-center justify-between">
                <span class="text-[20px] font-bold text-slate-900 tracking-wider">
                  {{ familyStore.familyCode }}
                </span>
                <button
                  type="button"
                  class="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                  @click="copyCode"
                >
                  <Check v-if="copied" class="w-[16px] h-[16px] text-emerald-500" />
                  <Copy v-else class="w-[16px] h-[16px]" />
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                이 코드를 가족에게 공유하세요
              </p>
            </div>

            <!-- 구성원 목록 -->
            <div>
              <p class="text-[12px] text-slate-500 mb-2">
                구성원 ({{ familyStore.memberCount }}명)
              </p>
              <div class="space-y-2">
                <div
                  v-for="member in familyStore.members"
                  :key="member.id"
                  class="flex items-center gap-2 py-1"
                >
                  <img
                    v-if="member.profile_image"
                    :src="member.profile_image"
                    alt=""
                    class="w-[28px] h-[28px] rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-[28px] h-[28px] rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]"
                  >
                    ?
                  </div>
                  <span class="text-[13px] text-slate-700">
                    {{ member.nickname || '이름 없음' }}
                  </span>
                  <span
                    v-if="member.user_id === authStore.getUserId()"
                    class="text-[10px] text-slate-400"
                  >
                    (나)
                  </span>
                </div>
              </div>
            </div>

            <!-- 가족 나가기 -->
            <button
              type="button"
              class="w-full flex items-center justify-center gap-2 h-[40px] rounded-xl text-[13px] font-medium text-rose-500 border border-rose-200 hover:bg-rose-50"
              @click="handleLeaveFamily"
            >
              <LogOut class="w-[16px] h-[16px]" />
              가족에서 나가기
            </button>
          </div>

          <!-- 가족이 없는 경우 -->
          <div v-else class="space-y-3">
            <p class="text-[13px] text-slate-500">
              패밀리 코드를 발급하거나, 다른 가족의 코드를 입력하세요.
            </p>

            <!-- 코드 발급 -->
            <button
              type="button"
              class="w-full flex items-center justify-center gap-2 h-[44px] rounded-xl text-[14px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600"
              :disabled="familyStore.loading"
              @click="handleCreateFamily"
            >
              <UserPlus class="w-[18px] h-[18px]" />
              새 패밀리 코드 발급
            </button>

            <!-- 코드 입력 -->
            <div class="flex gap-2">
              <input
                v-model="joinCode"
                type="text"
                class="flex-1 h-[44px] px-3 rounded-xl border border-slate-200 text-[14px] uppercase tracking-wider text-center"
                placeholder="코드 입력"
                maxlength="6"
              />
              <button
                type="button"
                class="h-[44px] px-4 rounded-xl text-[14px] font-semibold text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                :disabled="familyStore.loading"
                @click="handleJoinFamily"
              >
                참여
              </button>
            </div>

            <!-- 메시지 -->
            <p
              v-if="joinMessage"
              class="text-[12px] text-center"
              :class="joinError ? 'text-rose-500' : 'text-emerald-600'"
            >
              {{ joinMessage }}
            </p>
          </div>
        </section>
      </div>
    </div>
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

.modal-enter-active .w-full,
.modal-leave-active .w-full {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .w-full,
.modal-leave-to .w-full {
  transform: scale(0.95);
  opacity: 0;
}
</style>
