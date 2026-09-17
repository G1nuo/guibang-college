<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const keyword = ref((route.query.keyword as string) ?? '')

function onSearch() {
  router.push({ path: '/courses', query: keyword.value ? { keyword: keyword.value } : {} })
}

function goLogin() {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

async function onCommand(cmd: string) {
  if (cmd === 'profile') {
    router.push('/profile')
  } else if (cmd === 'orders') {
    router.push({ path: '/profile', query: { tab: 'orders' } })
  } else if (cmd === 'favorites') {
    router.push({ path: '/profile', query: { tab: 'favorites' } })
  } else if (cmd === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '退出提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      ElMessage.success('已安全退出')
      if (route.meta.requiresAuth) router.push('/')
    } catch {
      /* 用户取消 */
    }
  }
}
</script>

<template>
  <header class="gg-header">
    <div class="gg-container header-inner">
      <!-- Logo -->
      <router-link to="/" class="brand">
        <span class="brand-logo">
          <svg viewBox="0 0 1024 1024" width="26" height="26" fill="currentColor">
            <path
              d="M512 128L64 341.3l448 213.3 384-183v300.4h85.3V341.3L512 128zM234.7 486.4v192c0 71.4 124.2 128 277.3 128s277.3-56.6 277.3-128v-192L512 622.9 234.7 486.4z"
            />
          </svg>
        </span>
        <span class="brand-name">桂冠学堂</span>
      </router-link>

      <!-- 导航 -->
      <nav class="main-nav">
        <router-link to="/" class="nav-item" exact-active-class="active">首页</router-link>
        <router-link to="/courses" class="nav-item" active-class="active">课程中心</router-link>
        <router-link to="/live/1" class="nav-item" active-class="active">直播课堂</router-link>
        <router-link to="/profile" class="nav-item" active-class="active">个人中心</router-link>
      </nav>

      <!-- 搜索 + 用户区 -->
      <div class="header-right">
        <el-input
          v-model="keyword"
          class="header-search"
          placeholder="搜索课程 / 讲师"
          clearable
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 未登录：右上角登录按钮 -->
        <el-button
          v-if="!userStore.isLoggedIn"
          type="primary"
          round
          class="login-btn"
          @click="goLogin"
        >
          <el-icon style="margin-right: 4px"><User /></el-icon>登录 / 注册
        </el-button>

        <!-- 已登录：用户下拉 -->
        <el-dropdown v-else trigger="click" @command="onCommand">
          <span class="user-chip">
            <el-avatar :size="34" :style="{ background: userStore.user?.avatarColor }">
              {{ userStore.nickname.slice(0, 1) }}
            </el-avatar>
            <span class="user-name">{{ userStore.nickname }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                {{ userStore.roleText }} · {{ userStore.user?.username }}
              </el-dropdown-item>
              <el-dropdown-item command="profile">
                <el-icon><UserFilled /></el-icon>我的学习
              </el-dropdown-item>
              <el-dropdown-item command="favorites">
                <el-icon><Star /></el-icon>我的收藏
              </el-dropdown-item>
              <el-dropdown-item command="orders">
                <el-icon><Tickets /></el-icon>订单记录
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<style scoped>
.gg-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--gg-header-h);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gg-line);
  z-index: 1000;
}

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--gg-primary), var(--gg-primary-deep));
  box-shadow: 0 4px 10px rgba(43, 86, 182, 0.35);
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(90deg, var(--gg-primary-deep), var(--gg-gold));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.main-nav {
  display: flex;
  gap: 8px;
  flex: 1;
}

.nav-item {
  padding: 8px 16px;
  font-size: 15px;
  color: var(--gg-ink-2);
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--gg-primary);
  background: var(--gg-primary-light);
}

.nav-item.active {
  color: var(--gg-primary);
  font-weight: 700;
  background: var(--gg-primary-light);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.header-search {
  width: 200px;
  transition: width 0.3s;
}

.header-search:focus-within {
  width: 250px;
}

.login-btn {
  font-weight: 600;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px 4px 4px;
  border-radius: 22px;
  transition: background 0.2s;
  outline: none;
}

.user-chip:hover {
  background: var(--gg-bg-2);
}

.user-name {
  font-size: 14px;
  color: var(--gg-ink);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .header-search {
    display: none;
  }
  .main-nav {
    gap: 0;
  }
  .nav-item {
    padding: 8px 10px;
    font-size: 14px;
  }
  .user-name {
    display: none;
  }
}
</style>
