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
    if (!window.Kakao) {
      console.error('Kakao SDK가 로드되지 않았습니다.')
      return false
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY)
      console.log('Kakao SDK 초기화 완료')
    }
    return true
  }

  const initialize = (): Promise<void> => {
    return new Promise((resolve) => {
      loading.value = true
      
      if (!initializeKakao()) {
        loading.value = false
        isInitialized.value = true
        resolve()
        return
      }

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
              console.log('자동 로그인 성공:', res)
              user.value = res
              localStorage.setItem('kakao_user', JSON.stringify(res))
              loading.value = false
              isInitialized.value = true
              resolve()
            },
            fail: (err: any) => {
              console.log('토큰 만료, 재로그인 필요:', err)
              clearStoredAuth()
              loading.value = false
              isInitialized.value = true
              resolve()
            },
          })
        } catch (e) {
          console.error('자동 로그인 오류:', e)
          clearStoredAuth()
          loading.value = false
          isInitialized.value = true
          resolve()
        }
      } else {
        loading.value = false
        isInitialized.value = true
        resolve()
      }
    })
  }

  const clearStoredAuth = () => {
    localStorage.removeItem('kakao_token')
    localStorage.removeItem('kakao_user')
    user.value = null
    if (window.Kakao?.Auth) {
      window.Kakao.Auth.setAccessToken(null)
    }
  }

  const signInWithKakao = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!initializeKakao()) {
        alert('카카오 SDK를 불러오지 못했습니다. 페이지를 새로고침해주세요.')
        resolve(false)
        return
      }
      
      console.log('카카오 로그인 시도...')
      
      window.Kakao.Auth.login({
        success: (authObj: any) => {
          console.log('카카오 로그인 성공:', authObj)
          
          // 토큰 저장
          localStorage.setItem('kakao_token', authObj.access_token)
          
          // 사용자 정보 가져오기
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res: KakaoUser) => {
              console.log('사용자 정보:', res)
              user.value = res
              localStorage.setItem('kakao_user', JSON.stringify(res))
              resolve(true)
            },
            fail: (err: any) => {
              console.error('사용자 정보 요청 실패:', err)
              alert('사용자 정보를 가져오는데 실패했습니다.')
              resolve(false)
            },
          })
        },
        fail: (err: any) => {
          console.error('카카오 로그인 실패:', err)
          if (err.error === 'access_denied') {
            alert('로그인이 취소되었습니다.')
          } else {
            alert('로그인에 실패했습니다: ' + (err.error_description || err.error || '알 수 없는 오류'))
          }
          resolve(false)
        },
      })
    })
  }

  const signOut = async () => {
    if (!initializeKakao()) {
      clearStoredAuth()
      return
    }
    
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
