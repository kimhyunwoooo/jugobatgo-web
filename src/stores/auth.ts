import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

declare global {
  interface Window {
    Kakao: any
  }
}

interface KakaoUser {
  id: number
  properties?: {
    nickname?: string
    profile_image?: string
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<KakaoUser | null>(null)
  const loading = ref(true)
  const isInitialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)

  const KAKAO_JS_KEY = 'af87e3fa7eb2e00158da62151630e58d'

  const initializeKakao = () => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY)
    }
  }

  const initialize = async () => {
    loading.value = true
    initializeKakao()

    // 로컬 스토리지에서 사용자 정보 복원
    const savedUser = localStorage.getItem('kakao_user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        localStorage.removeItem('kakao_user')
      }
    }

    isInitialized.value = true
    loading.value = false
  }

  const signInWithKakao = () => {
    initializeKakao()
    
    window.Kakao.Auth.login({
      success: async (authObj: any) => {
        console.log('카카오 로그인 성공', authObj)
        
        // 사용자 정보 가져오기
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: async (res: KakaoUser) => {
            console.log('사용자 정보', res)
            user.value = res
            localStorage.setItem('kakao_user', JSON.stringify(res))
            
          },
          fail: (err: any) => {
            console.error('사용자 정보 요청 실패', err)
            alert('사용자 정보를 가져오는데 실패했습니다.')
          },
        })
      },
      fail: (err: any) => {
        console.error('카카오 로그인 실패', err)
        alert('로그인에 실패했습니다.')
      },
    })
  }

  const signOut = async () => {
    initializeKakao()
    
    if (window.Kakao.Auth.getAccessToken()) {
      window.Kakao.Auth.logout(() => {
        console.log('카카오 로그아웃 완료')
      })
    }
    
    user.value = null
    localStorage.removeItem('kakao_user')
  }

  // 사용자 ID 반환 (family_code로 사용)
  const getUserId = () => {
    return user.value ? String(user.value.id) : null
  }

  return {
    user,
    loading,
    isLoggedIn,
    isInitialized,
    initialize,
    signInWithKakao,
    signOut,
    getUserId,
  }
})
