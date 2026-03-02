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

    // 저장된 토큰과 사용자 정보 복원
    const savedToken = localStorage.getItem('kakao_token')
    const savedUser = localStorage.getItem('kakao_user')

    if (savedToken && savedUser) {
      try {
        // 토큰을 SDK에 설정
        window.Kakao.Auth.setAccessToken(savedToken)
        
        // 토큰 유효성 검증 (API 호출로 확인)
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res: KakaoUser) => {
            user.value = res
            // 최신 정보로 업데이트
            localStorage.setItem('kakao_user', JSON.stringify(res))
            loading.value = false
          },
          fail: () => {
            // 토큰이 만료되었거나 유효하지 않음
            clearStoredAuth()
            loading.value = false
          },
        })
      } catch {
        clearStoredAuth()
        loading.value = false
      }
    } else {
      loading.value = false
    }

    isInitialized.value = true
  }

  const clearStoredAuth = () => {
    localStorage.removeItem('kakao_token')
    localStorage.removeItem('kakao_user')
    user.value = null
    if (window.Kakao?.Auth) {
      window.Kakao.Auth.setAccessToken(null)
    }
  }

  const signInWithKakao = () => {
    initializeKakao()
    
    window.Kakao.Auth.login({
      success: (authObj: any) => {
        console.log('카카오 로그인 성공', authObj)
        
        // 토큰 저장
        localStorage.setItem('kakao_token', authObj.access_token)
        
        // 사용자 정보 가져오기
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res: KakaoUser) => {
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
    
    clearStoredAuth()
  }

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
