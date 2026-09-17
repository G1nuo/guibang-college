import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getStorage, TOKEN_KEY } from '../utils/storage'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: '首页 · 桂冠学堂' }
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('../views/CourseCenterView.vue'),
      meta: { title: '课程中心 · 桂冠学堂' }
    },
    {
      path: '/course/:id',
      name: 'course-detail',
      component: () => import('../views/CourseDetailView.vue'),
      meta: { title: '课程详情 · 桂冠学堂' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登录 / 注册 · 桂冠学堂' }
    },
    {
      path: '/live/:id?',
      name: 'live-room',
      component: () => import('../views/LiveRoomView.vue'),
      meta: { title: '直播课堂 · 桂冠学堂', requiresAuth: true, bare: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { title: '个人中心 · 桂冠学堂', requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

/* ===== 全局前置守卫：未登录拦截并跳转登录页 ===== */
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) ?? '桂冠学堂'
  if (to.meta.requiresAuth && !getStorage(TOKEN_KEY)) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  // 已登录用户不允许再进登录页
  if (to.name === 'login' && getStorage(TOKEN_KEY)) {
    next({ path: '/' })
    return
  }
  // 顺带确保 Pinia 用户信息存在（localStorage 被部分清理的兜底）
  const store = useUserStore()
  if (getStorage(TOKEN_KEY) && !store.user) {
    store.logout()
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
