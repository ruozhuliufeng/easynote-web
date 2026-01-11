import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, logout, getCurrentUser, type LoginParams, type RegisterParams, type UserInfo } from '@/api/user'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function doLogin(params: LoginParams) {
    const res = await login(params)
    if (res.code === 200) {
      token.value = res.data.token
      userInfo.value = res.data.userInfo
      localStorage.setItem('token', res.data.token)
      return true
    }
    return false
  }

  // 注册
  async function doRegister(params: RegisterParams) {
    const res = await register(params)
    if (res.code === 200) {
      token.value = res.data.token
      userInfo.value = res.data.userInfo
      localStorage.setItem('token', res.data.token)
      return true
    }
    return false
  }

  // 登出
  async function doLogout() {
    try {
      await logout()
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await getCurrentUser()
      if (res.code === 200) {
        userInfo.value = res.data
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    doLogin,
    doRegister,
    doLogout,
    fetchUserInfo
  }
})
