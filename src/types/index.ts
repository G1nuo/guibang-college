/* ===== 桂冠学堂 · 全局类型定义 ===== */

export type UserRole = 'student' | 'teacher' | 'admin'

/** 用户账户（对应后端 user 表） */
export interface User {
  id: number
  username: string
  password: string
  nickname: string
  phone: string
  avatarColor: string
  role: UserRole
  createdAt: string // ISO 时间，注册即录入
}

/** 讲师 */
export interface Teacher {
  id: number
  name: string
  title: string
  org: string
  tags: string[]
  intro: string
  studentCount: number
  courseCount: number
  cover: string
}

/** 课程章节 */
export interface Chapter {
  title: string
  duration: string
  free?: boolean
}

/** 课程 */
export interface Course {
  id: number
  title: string
  category: string
  teacherId: number
  price: number
  originalPrice?: number
  rating: number
  students: number
  level: '入门' | '进阶' | '实战'
  duration: string
  hours: number
  intro: string
  chapters: Chapter[]
  videoUrl: string
  subtitleUrl?: string
  tags: string[]
  hot?: boolean
  isNew?: boolean
  cover: string
  updatedAt: string
}

/** 订单记录 */
export interface Order {
  id: string
  userId: number
  courseId: number
  courseTitle: string
  cover: string
  amount: number
  payMethod: string
  status: 'paid' | 'refunded'
  createdAt: string
}

/** 收藏 */
export interface Favorite {
  userId: number
  courseId: number
  createdAt: string
}

/** 学习进度 */
export interface LearningProgress {
  userId: number
  courseId: number
  position: number // 秒
  duration: number // 秒
  finished: boolean
  updatedAt: string
}

/** 聊天消息 */
export interface ChatMessage {
  id: number
  name: string
  content: string
  time: string
  self?: boolean
  teacher?: boolean
}

/** 直播成员 */
export interface LiveMember {
  id: number
  name: string
  role: 'teacher' | 'student'
  micOn: boolean
  camOn: boolean
  color: string
}
