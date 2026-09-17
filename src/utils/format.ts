/* ===== 通用格式化工具 ===== */

/** 秒 -> mm:ss / hh:mm:ss */
export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0
  const s = Math.floor(sec % 60)
  const m = Math.floor((sec / 60) % 60)
  const h = Math.floor(sec / 3600)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`
}

/** ISO 时间 -> YYYY-MM-DD HH:mm */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

/** 人数 12000 -> 1.2万 */
export function formatCount(n: number): string {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n)
}

/** 金额，分 -> 元（这里直接元，保留两位） */
export function formatMoney(n: number): string {
  return `¥${n.toFixed(2)}`
}

/** 简单 base64（模拟 JWT 编码，非安全用途） */
export function b64encode(obj: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
}

export function b64decode<T>(str: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str)))) as T
  } catch {
    return null
  }
}
