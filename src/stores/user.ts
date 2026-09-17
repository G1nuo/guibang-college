import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi, type SafeUser } from '../api'
import {
  getStorage,
  removeStorage,
  setStorage,
  TOKEN_KEY,
  USER_KEY
} from '../utils/storage'

export const useUserStore = defineStore('user', () => {
  // 初始值直接从 localStorage 恢复（刷新页面保持登录）
  const token = ref<string>(getStorage<string>(TOKEN_KEY) ?? '')
  const user = ref<SafeUser | null>(getStorage<SafeUser>(USER_KEY))

  const isLoggedIn = computed(() => !!token.value)
  const nickname = computed(() => user.value?.nickname ?? '游客')
  const roleText = computed(() => {
    return { student: '学员', teacher: '讲师', admin: '管理员' }[
      user.value?.role ?? 'student'
    ]
  })

  function setAuth(t: string, u: SafeUser) {
    token.value = t
    user.value = u
    setStorage(TOKEN_KEY, t) // Token 持久化
    setStorage(USER_KEY, u)
  }

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password)
    setAuth(res.token, res.user)
    return res.user
  }

  async function register(form: {
    username: string
    password: string
    nickname: string
    phone: string
  }) {
    const res = await authApi.register(form)
    setAuth(res.token, res.user)
    return res.user
  }

  function logout() {
    token.value = ''
    user.value = null
    removeStorage(TOKEN_KEY)
    removeStorage(USER_KEY)
  }

  return {
    token,
    user,
    isLoggedIn,
    nickname,
    roleText,
    login,
    register,
    logout
  }
})
