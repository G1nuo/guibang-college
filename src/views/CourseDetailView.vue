<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { courseApi, favoriteApi, orderApi, progressApi } from '../api'
import type { Course, LearningProgress } from '../types'
import { formatCount, formatTime } from '../utils/format'
import { onImgError } from '../utils/image'
import { useUserStore } from '../stores/user'
import VideoPlayer from '../components/VideoPlayer.vue'
import SkeletonCard from '../components/SkeletonCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const course = ref<Course | null>(null)
const loading = ref(true)
const owned = ref(false)
const favored = ref(false)
const progress = ref<LearningProgress | null>(null)
const activeTab = ref('intro')

const playerRef = ref<InstanceType<typeof VideoPlayer>>()
const payDialog = ref(false)
const payMethod = ref('微信支付')
const paying = ref(false)

const teacher = computed(() =>
  course.value ? courseApi.teacherOf(course.value.teacherId) : null
)

const progressPercent = computed(() => {
  if (!progress.value || !progress.value.duration) return 0
  return Math.round((progress.value.position / progress.value.duration) * 100)
})

function requireLogin(): boolean {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再操作')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return false
  }
  return true
}

async function load() {
  loading.value = true
  const id = Number(route.params.id)
  try {
    course.value = await courseApi.detail(id)
    if (userStore.isLoggedIn) {
      const [orders, favs, prog] = await Promise.all([
        orderApi.list(userStore.user!.id),
        favoriteApi.list(userStore.user!.id),
        progressApi.get(userStore.user!.id, id)
      ])
      owned.value = orders.some((o) => o.courseId === id && o.status === 'paid')
      favored.value = favs.some((f) => f.courseId === id)
      progress.value = prog
    }
  } catch (e) {
    ElMessage.error((e as Error).message)
  } finally {
    loading.value = false
  }
}

/** 收藏 / 取消收藏 */
async function toggleFavorite() {
  if (!requireLogin() || !course.value) return
  const { favored: f } = await favoriteApi.toggle(
    userStore.user!.id,
    course.value.id
  )
  favored.value = f
  ElMessage.success(f ? '已加入收藏' : '已取消收藏')
}

/** 点击购买 */
function buy() {
  if (!requireLogin()) return
  if (owned.value) {
    ElMessage.info('你已购买该课程，可直接观看')
    return
  }
  payDialog.value = true
}

async function confirmPay() {
  if (!course.value) return
  paying.value = true
  try {
    await orderApi.create(userStore.user!.id, course.value.id, payMethod.value)
    ElMessage.success('支付成功，课程已加入「我的课程」')
    payDialog.value = false
    owned.value = true
    playerRef.value?.unlock()
  } catch (e) {
    ElMessage.error((e as Error).message)
  } finally {
    paying.value = false
  }
}

/** 播放器进度上报（仅购买用户记录学习进度） */
async function onProgress(p: { position: number; duration: number }) {
  if (!owned.value || !course.value) return
  const rec: LearningProgress = {
    userId: userStore.user!.id,
    courseId: course.value.id,
    position: p.position,
    duration: p.duration,
    finished: p.position / p.duration >= 0.95,
    updatedAt: new Date().toISOString()
  }
  progress.value = rec
  await progressApi.save(rec)
}

function onEnded() {
  ElMessage.success('恭喜你完成本课程学习，桂冠加身！')
}

/** 试看结束 */
function onTrialEnd() {
  ElMessage.warning('试看结束，购买后解锁完整课程')
  payDialog.value = true
}

function goLive() {
  if (!requireLogin()) return
  router.push(`/live/${course.value?.id ?? 1}`)
}

onMounted(load)
</script>

<template>
  <div class="gg-container detail-page">
    <div v-if="loading" class="loading-wrap">
      <SkeletonCard />
    </div>

    <template v-else-if="course">
      <div class="detail-grid">
        <!-- 左侧：播放器 + 标签页 -->
        <div class="left-col">
          <VideoPlayer
            ref="playerRef"
            :src="course.videoUrl"
            :poster="course.cover"
            :subtitle-url="course.subtitleUrl"
            :resume-sec="owned && progress ? progress.position : 0"
            :trial-limit="owned ? 0 : 60"
            @progress="onProgress"
            @ended="onEnded"
            @trial-end="onTrialEnd"
          />

          <!-- 学习进度条 -->
          <div v-if="owned" class="learn-progress">
            <div class="lp-head">
              <span>我的学习进度</span>
              <span :class="{ done: progress?.finished }">
                {{ progress?.finished ? '已完成 🎉' : progressPercent + '%' }}
              </span>
            </div>
            <el-progress
              :percentage="progressPercent"
              :stroke-width="10"
              :color="progress?.finished ? '#2fa972' : '#2b56b6'"
            />
            <p v-if="progress" class="lp-tip">
              上次学习到 {{ formatTime(progress.position) }}，已自动记录进度
            </p>
          </div>

          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="课程介绍" name="intro">
              <p class="intro-text">{{ course.intro }}</p>
              <div class="tag-line">
                <span v-for="t in course.tags" :key="t" class="gg-tag">{{ t }}</span>
              </div>
            </el-tab-pane>
            <el-tab-pane label="章节目录" name="chapters">
              <ul class="chapter-list">
                <li v-for="(ch, i) in course.chapters" :key="i" class="chapter-item">
                  <span class="ch-index">{{ i + 1 }}</span>
                  <span class="ch-title">{{ ch.title }}</span>
                  <span class="ch-duration">{{ ch.duration }}</span>
                  <el-tag
                    v-if="ch.free || owned"
                    :type="ch.free ? 'success' : 'info'"
                    size="small"
                  >
                    {{ ch.free ? '试看' : '可观看' }}
                  </el-tag>
                  <el-icon v-else class="lock-icon"><Lock /></el-icon>
                </li>
              </ul>
            </el-tab-pane>
            <el-tab-pane label="讲师介绍" name="teacher">
              <div v-if="teacher" class="teacher-box">
                <img :src="teacher.cover" :alt="teacher.name" @error="onImgError" />
                <div>
                  <h3>{{ teacher.name }} <span class="t-title">{{ teacher.title }}</span></h3>
                  <p class="t-org">{{ teacher.org }}</p>
                  <p class="t-intro">{{ teacher.intro }}</p>
                  <p class="t-stats">
                    累计学员 {{ formatCount(teacher.studentCount) }} 人 · {{ teacher.courseCount }} 门课程
                  </p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 右侧：课程信息卡 -->
        <div class="right-col">
          <div class="info-card">
            <div class="tags">
              <span v-for="t in course.tags" :key="t" class="gg-tag">{{ t }}</span>
            </div>
            <h1 class="c-title">{{ course.title }}</h1>
            <div class="c-meta">
              <span class="rating"><el-icon><Star /></el-icon>{{ course.rating.toFixed(1) }} 分</span>
              <span>{{ formatCount(course.students) }} 人在学</span>
              <span>{{ course.level }} · {{ course.duration }}</span>
            </div>
            <div class="c-price">
              <span class="now">¥{{ course.price }}</span>
              <span v-if="course.originalPrice" class="old">¥{{ course.originalPrice }}</span>
              <span class="save">立省 ¥{{ (course.originalPrice ?? course.price) - course.price }}</span>
            </div>

            <button class="gg-btn gg-btn-gold buy-btn" @click="buy">
              {{ owned ? '已购买 · 继续学习' : '立即购买' }}
            </button>
            <div class="btn-row">
              <button
                class="gg-btn gg-btn-ghost fav-btn"
                :class="{ active: favored }"
                @click="toggleFavorite"
              >
                <el-icon><StarFilled v-if="favored" /><Star v-else /></el-icon>
                {{ favored ? '已收藏' : '收藏课程' }}
              </button>
              <button class="gg-btn gg-btn-ghost" @click="goLive">
                <el-icon><VideoCamera /></el-icon>直播答疑
              </button>
            </div>

            <ul class="c-points">
              <li><el-icon><CircleCheck /></el-icon>购买后永久有效，支持断点续播</li>
              <li><el-icon><CircleCheck /></el-icon>讲师直播答疑 + 社群伴学</li>
              <li><el-icon><CircleCheck /></el-icon>学完颁发结业证书</li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <!-- 支付弹窗 -->
    <el-dialog v-model="payDialog" title="确认订单" width="380px" align-center>
      <div v-if="course" class="pay-box">
        <p class="pay-course">{{ course.title }}</p>
        <p class="pay-amount">应付金额：<strong>¥{{ course.price }}</strong></p>
        <el-radio-group v-model="payMethod" class="pay-methods">
          <el-radio value="微信支付">💚 微信支付</el-radio>
          <el-radio value="支付宝">💙 支付宝</el-radio>
        </el-radio-group>
        <p class="pay-tip">演示环境：点击支付即模拟扣款并生成订单</p>
      </div>
      <template #footer>
        <el-button @click="payDialog = false">取消</el-button>
        <el-button type="primary" :loading="paying" @click="confirmPay">
          确认支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.detail-page {
  padding: 24px 20px 50px;
}

.loading-wrap {
  padding: 20px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.learn-progress {
  background: #fff;
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  padding: 16px 20px;
  margin-top: 16px;
}

.lp-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.lp-head span:last-child {
  color: var(--gg-primary);
}

.lp-head .done {
  color: var(--gg-success);
}

.lp-tip {
  font-size: 12px;
  color: var(--gg-ink-3);
  margin-top: 8px;
}

.detail-tabs {
  background: #fff;
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  padding: 8px 24px 24px;
  margin-top: 16px;
}

.intro-text {
  font-size: 15px;
  line-height: 2;
  color: var(--gg-ink-2);
}

.tag-line {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.chapter-list {
  margin-top: 6px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 6px;
  border-bottom: 1px dashed var(--gg-line);
  font-size: 14px;
}

.ch-index {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--gg-primary-light);
  color: var(--gg-primary);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.ch-title {
  flex: 1;
}

.ch-duration {
  color: var(--gg-ink-3);
  font-size: 13px;
}

.lock-icon {
  color: var(--gg-ink-3);
}

.teacher-box {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.teacher-box img {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.teacher-box h3 {
  font-size: 18px;
}

.t-title {
  font-size: 13px;
  color: var(--gg-primary);
  font-weight: 400;
  margin-left: 8px;
}

.t-org {
  font-size: 13px;
  color: var(--gg-gold);
  margin: 6px 0;
}

.t-intro {
  font-size: 14px;
  color: var(--gg-ink-2);
  line-height: 1.9;
}

.t-stats {
  font-size: 13px;
  color: var(--gg-ink-3);
  margin-top: 8px;
}

.info-card {
  background: #fff;
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius-lg);
  padding: 24px;
  position: sticky;
  top: calc(var(--gg-header-h) + 20px);
}

.info-card .tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.c-title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.5;
  margin-bottom: 12px;
}

.c-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  color: var(--gg-ink-3);
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--gg-line);
}

.rating {
  color: var(--gg-gold);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 3px;
}

.c-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px 0;
}

.c-price .now {
  font-size: 30px;
  font-weight: 800;
  color: var(--gg-danger);
}

.c-price .old {
  font-size: 14px;
  color: var(--gg-ink-3);
  text-decoration: line-through;
}

.c-price .save {
  font-size: 12px;
  color: #fff;
  background: var(--gg-gold);
  padding: 2px 8px;
  border-radius: 10px;
}

.buy-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
}

.btn-row {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.fav-btn.active {
  color: var(--gg-gold);
  background: var(--gg-gold-light);
}

.btn-row .gg-btn {
  flex: 1;
  height: 38px;
  font-size: 13px;
}

.c-points {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed var(--gg-line);
}

.c-points li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gg-ink-2);
  line-height: 2.2;
}

.c-points .el-icon {
  color: var(--gg-success);
}

.pay-course {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.pay-amount {
  font-size: 14px;
  color: var(--gg-ink-2);
  margin-bottom: 16px;
}

.pay-amount strong {
  color: var(--gg-danger);
  font-size: 22px;
}

.pay-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.pay-tip {
  font-size: 12px;
  color: var(--gg-ink-3);
}

@media (max-width: 960px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .info-card {
    position: static;
  }
}
</style>
