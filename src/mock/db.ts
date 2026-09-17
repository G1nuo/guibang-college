import type {
  Favorite,
  LearningProgress,
  Order,
  User
} from '../types'

/**
 * 模拟后端数据库：使用 localStorage 持久化。
 * 注册的账户会真实“录入”到 users 表中，刷新页面依然存在。
 */
const DB_KEY = 'ggxueyuan_db_v1'

interface DBShape {
  users: User[]
  orders: Order[]
  favorites: Favorite[]
  progress: LearningProgress[]
}

/* 演示账号（学生 / 讲师 / 管理员，密码均为 123456） */
function seedUsers(): User[] {
  const now = new Date('2026-09-10T09:00:00')
  const list: User[] = [
    {
      id: 1,
      username: 'student',
      password: '123456',
      nickname: '李同学',
      phone: '13800000001',
      avatarColor: '#2b56b6',
      role: 'student',
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString()
    },
    {
      id: 2,
      username: 'teacher',
      password: '123456',
      nickname: '陈昭明',
      phone: '13800000002',
      avatarColor: '#c99b3c',
      role: 'teacher',
      createdAt: new Date(now.getTime() - 200 * 86400000).toISOString()
    },
    {
      id: 3,
      username: 'admin',
      password: '123456',
      nickname: '平台管理员',
      phone: '13800000003',
      avatarColor: '#1d3f8f',
      role: 'admin',
      createdAt: new Date(now.getTime() - 300 * 86400000).toISOString()
    }
  ]

  // 生成一批历史注册用户，用于平台注册趋势统计
  const surnames = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫']
  const given = ['浩然', '欣怡', '子涵', '宇航', '诗涵', '俊杰', '雨桐', '梓萱', '嘉懿', '晨曦']
  const colors = ['#2b56b6', '#c99b3c', '#2fa972', '#8b5cf6', '#ef9b3a', '#e25d58']
  let seed = 20260910
  const rand = () => {
    // 简单确定性伪随机，保证每次初始化数据稳定
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  // 近 7 个月（含当月）逐月增长的注册人数
  const monthly = [12, 15, 18, 22, 27, 31, 38]
  let uid = 4
  monthly.forEach((count, mIndex) => {
    for (let i = 0; i < count; i++) {
      const day = Math.floor(rand() * 27) + 1
      const d = new Date(2026, 2 + mIndex, day, 8 + (i % 12), (i * 7) % 60)
      list.push({
        id: uid,
        username: `user${uid}`,
        password: '123456',
        nickname: surnames[uid % surnames.length] + given[uid % given.length],
        phone: `138${String(10000000 + uid * 137).slice(0, 8)}`,
        avatarColor: colors[uid % colors.length],
        role: 'student',
        createdAt: d.toISOString()
      })
      uid++
    }
  })
  return list
}

function seedOrders(): Order[] {
  // 给演示学生账号预置 3 门已购课程，保证“我的课程”开箱即用
  const mk = (
    courseId: number,
    courseTitle: string,
    cover: string,
    amount: number,
    daysAgo: number,
    method: string
  ): Order => ({
    id: `GG${new Date(2026, 8, 10 - daysAgo).getTime()}${courseId}`,
    userId: 1,
    courseId,
    courseTitle,
    cover,
    amount,
    payMethod: method,
    status: 'paid',
    createdAt: new Date(
      new Date('2026-09-10T10:00:00').getTime() - daysAgo * 86400000
    ).toISOString()
  })
  return [
    mk(1, 'Vue3 + TypeScript 企业级实战开发', '', 199, 21, '微信支付'),
    mk(5, 'Python 机器学习入门到实战', '', 259, 9, '支付宝'),
    mk(11, '应届生简历优化与面试通关', '', 99, 3, '微信支付')
  ]
}

function seedFavorites(): Favorite[] {
  return [
    { userId: 1, courseId: 6, createdAt: new Date('2026-09-08T12:00:00').toISOString() },
    { userId: 1, courseId: 9, createdAt: new Date('2026-09-05T12:00:00').toISOString() }
  ]
}

function seedProgress(): LearningProgress[] {
  const mk = (
    courseId: number,
    position: number,
    duration: number,
    daysAgo: number
  ): LearningProgress => ({
    userId: 1,
    courseId,
    position,
    duration,
    finished: position / duration >= 0.95,
    updatedAt: new Date(
      new Date('2026-09-10T10:00:00').getTime() - daysAgo * 86400000
    ).toISOString()
  })
  return [
    mk(1, 1488, 2520, 0), // Vue3 课，约 59%
    mk(5, 2880, 3480, 1), // ML 课，约 83%
    mk(11, 720, 1200, 3) // 求职课，约 60%
  ]
}

export function getDB(): DBShape {
  const raw = localStorage.getItem(DB_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as DBShape
    } catch {
      // 数据损坏则重建
    }
  }
  const db: DBShape = {
    users: seedUsers(),
    orders: seedOrders(),
    favorites: seedFavorites(),
    progress: seedProgress()
  }
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  return db
}

export function saveDB(db: DBShape): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

let uidSeq = 0
export function nextUserId(users: User[]): number {
  if (uidSeq === 0) uidSeq = users.reduce((m, u) => Math.max(m, u.id), 3)
  uidSeq += 1
  return uidSeq
}

/** 应用启动时调用：确保数据库已初始化 */
export function initMockDB(): void {
  getDB()
}
