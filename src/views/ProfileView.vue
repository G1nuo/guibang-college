<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { EChartsOption } from 'echarts'
import { ElMessage } from 'element-plus'
import { courseApi, favoriteApi, orderApi, progressApi } from '../api'
import type { Course, LearningProgress, Order } from '../types'
import { formatDate, formatMoney, formatTime } from '../utils/format'
import { onImgError } from '../utils/image'
import { useUserStore } from '../stores/user'
import BaseChart from '../components/BaseChart.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeTab = ref((route.query.tab as string) === 'orders'
  ? 'orders'
  : (route.query.tab as string) === 'favorites'
    ? 'favorites'
    : 'courses')

const loading = ref(true)
const orders = ref<Order[]>([])
const favIds = ref<number[]>([])
const progressList = ref<LearningProgress[]>([])

const weekChartOption = ref<EChartsOption>({})
const finishChartOption = ref<EChartsOption>({})

/** 已购课程（我的课程） */
const myCourses = computed<{ course: Course; progress: LearningProgress | null; percent: number }[]>(() => {
  return orders.value
    .filter((o) => o.status === 'paid')
    .map((o) => {
      const course = courseApi.all().find((c) => c.id === o.courseId)
      const progress = progressList.value.find(
        (p) => p.courseId === o.courseId
      ) ?? null
      const percent = progress
        ? Math.round((progress.position / progress.duration) * 100)
        : 0
      return course ? { course, progress, percent } : null
    })
    .filter((x): x is { course: Course; progress: LearningProgress | null; percent: number } => !!x)
})

/** 收藏课程 */
const favCourses = computed<Course[]>(() =>
  favIds.value
    .map((id) => courseApi.all().find((c) => c.id === id))
    .filter((c): c is Course => !!c)
)

const totalHours = computed(() =>
  myCourses.value.reduce(
    (sum, x) => sum + x.course.hours * (x.percent / 100),
    0
  )
)

async function loadAll() {
  loading.value = true
  const uid = userStore.user!.id
  orders.value = await orderApi.list(uid)
  const favs = await favoriteApi.list(uid)
  favIds.value = favs.map((f) => f.courseId)
  progressList.value = await progressApi.list(uid)
  buildCharts()
  loading.value = false
}

function buildCharts() {
  // 近 7 天学习时长（由观看进度换算的演示数据）
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const hours = [1.2, 0.8, 1.6, 0.5, 2.1, 3.2, 2.6]
  weekChartOption.value = {
    tooltip: { trigger: 'axis', formatter: '{b}<br/>学习 {c} 小时' },
    grid: { left: 44, right: 20, top: 26, bottom: 30 },
    xAxis: {
      type: 'category',
      data: days,
      axisLabel: { color: '#8a94a6' },
      axisLine: { lineStyle: { color: '#e7ebf2' } }
    },
    yAxis: {
      type: 'value',
      name: '小时',
      splitLine: { lineStyle: { color: '#eef1f7' } },
      axisLabel: { color: '#8a94a6' }
    },
    series: [
      {
        type: 'bar',
        data: hours,
        barWidth: 26,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#c99b3c' },
              { offset: 1, color: '#e8cf95' }
            ]
          }
        },
        label: { show: true, position: 'top', color: '#c99b3c', formatter: '{c}h' }
      }
    ]
  }

  // 我的课程完成度
  finishChartOption.value = {
    tooltip: { trigger: 'item', formatter: '{b}<br/>完成度 {c}%' },
    radar: {
      indicator: myCourses.value.map((x) => ({
        name: x.course.title.slice(0, 8),
        max: 100
      })),
      radius: '64%',
      axisName: { color: '#4a5568', fontSize: 11 },
      splitArea: { areaStyle: { color: ['#f8faff', '#fff'] } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: myCourses.value.map((x) => x.percent),
            name: '学习完成度',
            areaStyle: { color: 'rgba(43,86,182,0.22)' },
            lineStyle: { color: '#2b56b6', width: 2 },
            itemStyle: { color: '#2b56b6' }
          }
        ]
      }
    ]
  }
}

async function cancelFav(courseId: number) {
  const { favored } = await favoriteApi.toggle(userStore.user!.id, courseId)
  if (!favored) {
    favIds.value = favIds.value.filter((id) => id !== courseId)
    ElMessage.success('已取消收藏')
  }
}

watch(
  () => route.query.tab,
  (t) => {
    if (t === 'orders' || t === 'favorites' || t === 'courses' || !t) {
      activeTab.value = (t as string) || 'courses'
    }
  }
)

onMounted(loadAll)
</script>

<template>
  <div class="gg-container profile-page" v-loading="loading">
    <!-- 用户信息横幅 -->
    <div class="profile-hero">
      <el-avatar :size="72" :style="{ background: userStore.user?.avatarColor, fontSize: '30px' }">
        {{ userStore.nickname.slice(0, 1) }}
      </el-avatar>
      <div class="hero-info">
        <h2>
          {{ userStore.nickname }}
          <el-tag size="small" effect="dark" round>{{ userStore.roleText }}</el-tag>
        </h2>
        <p>账号：{{ userStore.user?.username }} · 注册于 {{ formatDate(userStore.user!.createdAt) }}</p>
      </div>
      <div class="hero-stats">
        <div><strong>{{ myCourses.length }}</strong><span>在学课程</span></div>
        <div><strong>{{ favIds.length }}</strong><span>收藏课程</span></div>
        <div><strong>{{ orders.length }}</strong><span>订单记录</span></div>
        <div><strong>{{ totalHours.toFixed(1) }}</strong><span>学习时长(h)</span></div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="profile-tabs">
      <!-- ===== 我的课程 ===== -->
      <el-tab-pane name="courses">
        <template #label>
          <span class="tab-label"><el-icon><Reading /></el-icon>我的课程</span>
        </template>
        <div v-if="myCourses.length" class="my-course-list">
          <div v-for="item in myCourses" :key="item.course.id" class="my-course-item">
            <img
              :src="item.course.cover"
              :alt="item.course.title"
              @error="onImgError"
              @click="router.push(`/course/${item.course.id}`)"
            />
            <div class="mc-body">
              <h3 @click="router.push(`/course/${item.course.id}`)">{{ item.course.title }}</h3>
              <p class="mc-meta">
                {{ item.course.category }} · {{ item.course.duration }} ·
                上次学习：{{ item.progress ? formatDate(item.progress.updatedAt) : '尚未开始' }}
              </p>
              <div class="mc-progress">
                <el-progress
                  :percentage="item.percent"
                  :stroke-width="12"
                  :color="item.percent >= 95 ? '#2fa972' : '#2b56b6'"
                  :format="(p: number) => (p >= 95 ? '已完成 🎉' : `已学 ${p}%`)"
                />
              </div>
              <p v-if="item.progress" class="mc-point">
                已观看至 {{ formatTime(item.progress.position) }} / {{ formatTime(item.progress.duration) }}
              </p>
            </div>
            <el-button
              type="primary"
              round
              @click="router.push(`/course/${item.course.id}`)"
            >
              {{ item.percent > 0 && item.percent < 95 ? '继续学习' : item.percent >= 95 ? '回顾课程' : '开始学习' }}
            </el-button>
          </div>
        </div>
        <el-empty v-else description="还没有购买课程，去课程中心逛逛吧">
          <el-button type="primary" round @click="router.push('/courses')">去选课</el-button>
        </el-empty>
      </el-tab-pane>

      <!-- ===== 我的收藏 ===== -->
      <el-tab-pane name="favorites">
        <template #label>
          <span class="tab-label"><el-icon><Star /></el-icon>我的收藏</span>
        </template>
        <div v-if="favCourses.length" class="fav-grid">
          <div v-for="c in favCourses" :key="c.id" class="fav-card">
            <img :src="c.cover" :alt="c.title" @error="onImgError" @click="router.push(`/course/${c.id}`)" />
            <div class="fav-body">
              <h4 @click="router.push(`/course/${c.id}`)">{{ c.title }}</h4>
              <p>¥{{ c.price }}</p>
              <el-button text type="danger" size="small" @click="cancelFav(c.id)">
                取消收藏
              </el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="还没有收藏课程，看到喜欢的课程点个收藏吧" />
      </el-tab-pane>

      <!-- ===== 订单记录 ===== -->
      <el-tab-pane name="orders">
        <template #label>
          <span class="tab-label"><el-icon><Tickets /></el-icon>订单记录</span>
        </template>
        <el-table :data="orders" stripe class="order-table">
          <el-table-column prop="id" label="订单号" width="180">
            <template #default="{ row }">
              <span class="order-id">{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="courseTitle" label="课程名称" min-width="240" />
          <el-table-column prop="payMethod" label="支付方式" width="110" />
          <el-table-column label="金额" width="110">
            <template #default="{ row }">
              <strong class="amount">{{ formatMoney(row.amount) }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'paid' ? 'success' : 'info'" size="small">
                {{ row.status === 'paid' ? '已支付' : '已退款' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="下单时间" width="170">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                text
                type="primary"
                size="small"
                @click="router.push(`/course/${row.courseId}`)"
              >
                去学习
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ===== 学习数据 ===== -->
      <el-tab-pane name="stats">
        <template #label>
          <span class="tab-label"><el-icon><TrendCharts /></el-icon>学习数据</span>
        </template>
        <div class="stat-grid">
          <div class="stat-chart-card">
            <h4>近 7 天学习时长</h4>
            <BaseChart :option="weekChartOption" height="280px" />
          </div>
          <div class="stat-chart-card">
            <h4>我的课程完成度</h4>
            <BaseChart :option="finishChartOption" height="280px" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 24px 20px 50px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(120deg, var(--gg-primary-deep), var(--gg-primary) 70%, #4f7de0);
  border-radius: var(--gg-radius-lg);
  padding: 28px 32px;
  color: #fff;
  margin-bottom: 20px;
}

.hero-info {
  flex: 1;
}

.hero-info h2 {
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.hero-info p {
  font-size: 13px;
  opacity: 0.85;
}

.hero-stats {
  display: flex;
  gap: 30px;
}

.hero-stats div {
  text-align: center;
}

.hero-stats strong {
  display: block;
  font-size: 24px;
  font-weight: 800;
}

.hero-stats span {
  font-size: 12px;
  opacity: 0.85;
}

.profile-tabs {
  background: #fff;
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  padding: 10px 24px 24px;
  min-height: 420px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
}

/* 我的课程 */
.my-course-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px 8px;
  border-bottom: 1px solid var(--gg-line);
}

.my-course-item img {
  width: 200px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.25s;
}

.my-course-item img:hover {
  transform: scale(1.03);
}

.mc-body {
  flex: 1;
  min-width: 0;
}

.mc-body h3 {
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.mc-body h3:hover {
  color: var(--gg-primary);
}

.mc-meta {
  font-size: 13px;
  color: var(--gg-ink-3);
  margin: 8px 0 12px;
}

.mc-progress {
  max-width: 480px;
}

.mc-point {
  font-size: 12px;
  color: var(--gg-ink-3);
  margin-top: 6px;
}

/* 收藏 */
.fav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  padding-top: 8px;
}

.fav-card {
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  overflow: hidden;
  transition: box-shadow 0.25s;
}

.fav-card:hover {
  box-shadow: var(--gg-shadow);
}

.fav-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  cursor: pointer;
}

.fav-body {
  padding: 12px 14px;
}

.fav-body h4 {
  font-size: 14px;
  height: 40px;
  line-height: 1.45;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fav-body h4:hover {
  color: var(--gg-primary);
}

.fav-body p {
  color: var(--gg-danger);
  font-weight: 800;
  margin: 6px 0;
}

/* 订单 */
.order-id {
  font-size: 12px;
  color: var(--gg-ink-3);
}

.amount {
  color: var(--gg-danger);
}

/* 学习数据 */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding-top: 10px;
}

.stat-chart-card {
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  padding: 18px 20px 6px;
}

.stat-chart-card h4 {
  font-size: 15px;
  margin-bottom: 6px;
}

@media (max-width: 900px) {
  .fav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .hero-stats {
    gap: 16px;
  }
}
</style>
