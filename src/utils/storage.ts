/* localStorage 统一封装（Token / 用户信息持久化） */

export const TOKEN_KEY = 'gg_token'
export const USER_KEY = 'gg_user'

export function setStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function removeStorage(key: string): void {
  localStorage.removeItem(key)
}
