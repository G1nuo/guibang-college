import type {
  Course,
  Favorite,
  LearningProgress,
  Order,
  User
} from '../types'
import { courses, CATEGORIES, teachers } from '../data/catalog'
import { getDB, nextUserId, saveDB } from '../mock/db'
import { b64decode, b64encode } from '../utils/format'

/* 模拟网络延迟 */
const delay = (ms = 350) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms + Math.random() * 250))

export type SafeUser = Omit<User, 'password'>

function toSafe(u: User): SafeUser {
  const { password: _pwd, ...rest } = u
  return rest
}

/* ================= 认证 Token（模拟 JWT，Header.Payload.Sign） ================= */

function issueToken(u: User): string {
  const payload = b64encode({ uid: u.id, username: u.username, iat: Date.now() })
  return `GG.${payload}.${Math.random().toString(36).slice(2, 10)}`
}

function findUserByToken(token: string): User | null {
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'GG') return null
  const payload = b64decode<{ uid: number }>(parts[1])
  if (!payload) return null
  return getDB().users.find((u) => u.id === payload.uid) ?? null
}

/* ================= 认证接口 ================= */

export const authApi = {
  async login(username: string, password: string) {
    await delay(500)
    const db = getDB()
    const user = db.users.find((u) => u.username === username)
    if (!user) throw new Error('账户不存在，请先注册')
    if (user.password !== password) throw new Error('密码错误，请重新输入')
    return { token: issueToken(user), user: toSafe(user) }
  },

  async register(form: {
    username: string
    password: string
    nickname: string
    phone: string
  }) {
    await delay(600)
    const db = getDB()
    if (db.users.some((u) => u.username === form.username)) {
      throw new Error('该用户名已被注册')
    }
    const colors = ['#2b56b6', '#c99b3c', '#2fa972', '#8b5cf6', '#ef9b3a']
    const user: User = {
      id: nextUserId(db.users),
      username: form.username,
      password: form.password,
      nickname: form.nickname,
      phone: form.phone,
      avatarColor: colors[db.users.length % colors.length],
      role: 'student',
      createdAt: new Date().toISOString()
    }
    db.users.push(user) // ← 新用户实时录入“后端用户表”
    saveDB(db)
    return { token: issueToken(user), user: toSafe(user) }
  },

  async profile(token: string): Promise<SafeUser> {
    await delay(200)
    const user = findUserByToken(token)
    if (!user) throw new Error('登录状态已失效，请重新登录')
    return toSafe(user)
  }
}

/* ================= 课程接口（筛选 / 搜索 / 排序 / 分页） ================= */

export interface CourseQuery {
  category?: string
  keyword?: string
  sort?: 'hot' | 'rating' | 'price-asc' | 'price-desc' | 'newest'
  page?: number
  pageSize?: number
}

export const courseApi = {
  async list(q: CourseQuery = {}) {
    await delay(500)
    let list = [...courses]
    if (q.category && q.category !== '全部') {
      list = list.filter((c) => c.category === q.category)
    }
    if (q.keyword) {
      const kw = q.keyword.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(kw) ||
          c.intro.toLowerCase().includes(kw) ||
          c.tags.some((t) => t.toLowerCase().includes(kw)) ||
          teachers
            .find((t) => t.id === c.teacherId)
            ?.name.includes(q.keyword!.trim())
      )
    }
    switch (q.sort) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        break
      default:
        list.sort((a, b) => b.students - a.students)
    }
    const total = list.length
    const page = q.page ?? 1
    const pageSize = q.pageSize ?? 8
    return {
      total,
      list: list.slice((page - 1) * pageSize, page * pageSize)
    }
  },

  async detail(id: number): Promise<Course> {
    await delay(300)
    const c = courses.find((x) => x.id === id)
    if (!c) throw new Error('课程不存在')
    return c
  },

  /** 首页 / 推荐位使用（同步数据） */
  all() {
    return courses
  },
  categories() {
    return ['全部', ...CATEGORIES]
  },
  teacherOf(id: number) {
    return teachers.find((t) => t.id === id)
  },
  teachers() {
    return teachers
  }
}

/* ================= 订单接口 ================= */

export const orderApi = {
  async create(userId: number, courseId: number, payMethod: string) {
    await delay(700)
    const db = getDB()
    const course = courses.find((c) => c.id === courseId)
    if (!course) throw new Error('课程不存在')
    const exist = db.orders.find(
      (o) => o.userId === userId && o.courseId === courseId && o.status === 'paid'
    )
    if (exist) throw new Error('你已购买该课程，可直接开始学习')
    const order: Order = {
      id: `GG${Date.now()}${Math.floor(Math.random() * 100)}`,
      userId,
      courseId,
      courseTitle: course.title,
      cover: course.cover,
      amount: course.price,
      payMethod,
      status: 'paid',
      createdAt: new Date().toISOString()
    }
    db.orders.push(order)
    saveDB(db)
    return order
  },

  async list(userId: number): Promise<Order[]> {
    await delay(300)
    return getDB()
      .orders.filter((o) => o.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}

/* ================= 收藏接口 ================= */

export const favoriteApi = {
  async list(userId: number): Promise<Favorite[]> {
    await delay(250)
    return getDB()
      .favorites.filter((f) => f.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  },

  async toggle(userId: number, courseId: number): Promise<{ favored: boolean }> {
    await delay(250)
    const db = getDB()
    const idx = db.favorites.findIndex(
      (f) => f.userId === userId && f.courseId === courseId
    )
    if (idx >= 0) {
      db.favorites.splice(idx, 1)
      saveDB(db)
      return { favored: false }
    }
    db.favorites.push({
      userId,
      courseId,
      createdAt: new Date().toISOString()
    })
    saveDB(db)
    return { favored: true }
  }
}

/* ================= 学习进度接口 ================= */

export const progressApi = {
  async get(userId: number, courseId: number): Promise<LearningProgress | null> {
    await delay(200)
      return (
        getDB().progress.find(
          (p) => p.userId === userId && p.courseId === courseId
        ) ?? null
      )
  },

  async list(userId: number): Promise<LearningProgress[]> {
    return getDB().progress.filter((p) => p.userId === userId)
  },

  /** 播放器每 5 秒 / 暂停时上报进度（断点续播的数据来源） */
  async save(p: LearningProgress): Promise<void> {
    const db = getDB()
    const idx = db.progress.findIndex(
      (x) => x.userId === p.userId && x.courseId === p.courseId
    )
    if (idx >= 0) db.progress[idx] = p
    else db.progress.push(p)
    saveDB(db)
  }
}

/* ================= 平台统计（ECharts 数据） ================= */

export interface StatsOverview {
  totalUsers: number
  totalCourses: number
  totalTeachers: number
  totalLearning: number
  userGrowth: { month: string; count: number }[]
  categoryDist: { name: string; value: number }[]
}

export const statsApi = {
  async overview(): Promise<StatsOverview> {
    await delay(300)
    const users = getDB().users

    // 近 7 个月注册趋势
    const growth: { month: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(2026, 8 - i, 1)
      const next = new Date(2026, 9 - i, 1)
      growth.push({
        month: `${d.getMonth() + 1}月`,
        count: users.filter((u) => {
          const t = new Date(u.createdAt).getTime()
          return t >= d.getTime() && t < next.getTime()
        }).length
      })
    }

    // 各分类课程学习人次
    const dist = CATEGORIES.map((cat) => ({
      name: cat,
      value: courses
        .filter((c) => c.category === cat)
        .reduce((sum, c) => sum + c.students, 0)
    })).filter((x) => x.value > 0)

    return {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalTeachers: teachers.length,
      totalLearning: courses.reduce((s, c) => s + c.students, 0),
      userGrowth: growth,
      categoryDist: dist
    }
  }
}
