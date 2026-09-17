<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courseApi, type CourseQuery } from '../api'
import type { Course } from '../types'
import CourseCard from '../components/CourseCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'

const route = useRoute()
const router = useRouter()

const categories = courseApi.categories()
const list = ref<Course[]>([])
const total = ref(0)
const loading = ref(true)

const category = ref((route.query.category as string) ?? '全部')
const keyword = ref((route.query.keyword as string) ?? '')
const sort = ref<NonNullable<CourseQuery['sort']>>('hot')
const page = ref(1)
const pageSize = 8

const sortOptions = [
  { label: '综合热度', value: 'hot' },
  { label: '评分最高', value: 'rating' },
  { label: '价格从低到高', value: 'price-asc' },
  { label: '价格从高到低', value: 'price-desc' },
  { label: '最新上架', value: 'newest' }
] as const

async function load() {
  loading.value = true
  const res = await courseApi.list({
    category: category.value,
    keyword: keyword.value,
    sort: sort.value,
    page: page.value,
    pageSize
  })
  list.value = res.list
  total.value = res.total
  loading.value = false
}

function pickCategory(c: string) {
  category.value = c
  page.value = 1
  syncQuery()
  load()
}

function onSearch() {
  page.value = 1
  syncQuery()
  load()
}

function onSortChange() {
  page.value = 1
  load()
}

function onPageChange(p: number) {
  page.value = p
  load()
  window.scrollTo({ top: 200, behavior: 'smooth' })
}

/** 把筛选条件同步到地址栏，支持刷新保持 / 外链跳转 */
function syncQuery() {
  const query: Record<string, string> = {}
  if (category.value !== '全部') query.category = category.value
  if (keyword.value.trim()) query.keyword = keyword.value.trim()
  router.replace({ path: '/courses', query })
}

// 浏览器前进后退 / 页头搜索跳转时同步条件
watch(
  () => route.query,
  (q) => {
    const qc = (q.category as string) ?? '全部'
    const qk = (q.keyword as string) ?? ''
    if (qc !== category.value || qk !== keyword.value) {
      category.value = qc
      keyword.value = qk
      page.value = 1
      load()
    }
  }
)

onMounted(load)
</script>

<template>
  <div class="gg-container center-page">
    <!-- 页头横幅 -->
    <div class="page-banner">
      <h1>课程中心</h1>
      <p>12+ 方向 · 100+ 课时 · 讲师全程伴学，总有一门课适合你</p>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <span class="filter-label">分类：</span>
        <div class="cat-list">
          <button
            v-for="c in categories"
            :key="c"
            class="cat-btn"
            :class="{ active: category === c }"
            @click="pickCategory(c)"
          >
            {{ c }}
          </button>
        </div>
      </div>
      <div class="filter-row tools">
        <el-input
          v-model="keyword"
          class="search-input"
          placeholder="搜索课程名 / 标签 / 讲师"
          clearable
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" round @click="onSearch">搜索</el-button>
        <div class="sort-box">
          <span class="filter-label">排序：</span>
          <el-select v-model="sort" style="width: 150px" @change="onSortChange">
            <el-option
              v-for="o in sortOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>
      </div>
    </div>

    <p class="result-tip">
      共找到 <strong>{{ total }}</strong> 门课程
      <template v-if="keyword">，关键词「{{ keyword }}」</template>
    </p>

    <!-- 课程网格：骨架屏 / 列表 / 空状态 -->
    <div v-if="loading" class="course-grid">
      <SkeletonCard v-for="i in 8" :key="i" />
    </div>
    <div v-else-if="list.length" class="course-grid">
      <CourseCard v-for="c in list" :key="c.id" :course="c" />
    </div>
    <el-empty v-else description="没有找到符合条件的课程，换个关键词试试" class="empty">
      <el-button type="primary" round @click="pickCategory('全部')">查看全部课程</el-button>
    </el-empty>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.center-page {
  padding-top: 28px;
  padding-bottom: 40px;
}

.page-banner {
  background: linear-gradient(120deg, var(--gg-primary-deep), var(--gg-primary) 60%, #4f7de0);
  border-radius: var(--gg-radius-lg);
  padding: 40px 44px;
  color: #fff;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.page-banner::after {
  content: '🎓';
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 96px;
  opacity: 0.18;
}

.page-banner h1 {
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 10px;
}

.page-banner p {
  opacity: 0.9;
  font-size: 15px;
}

.filter-bar {
  background: #fff;
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  padding: 18px 22px;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.filter-row.tools {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--gg-line);
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: var(--gg-ink-2);
  font-weight: 600;
  line-height: 30px;
  white-space: nowrap;
}

.cat-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-btn {
  padding: 5px 16px;
  border-radius: 16px;
  border: 1px solid var(--gg-line);
  background: #fff;
  font-size: 13px;
  color: var(--gg-ink-2);
  cursor: pointer;
  transition: all 0.2s;
}

.cat-btn:hover {
  color: var(--gg-primary);
  border-color: var(--gg-primary);
}

.cat-btn.active {
  color: #fff;
  background: var(--gg-primary);
  border-color: var(--gg-primary);
}

.search-input {
  width: 280px;
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.result-tip {
  font-size: 14px;
  color: var(--gg-ink-3);
  margin: 16px 2px;
}

.result-tip strong {
  color: var(--gg-primary);
  font-size: 16px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.empty {
  background: #fff;
  border-radius: var(--gg-radius);
  padding: 40px 0;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 1024px) {
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .search-input {
    width: 100%;
  }
  .sort-box {
    margin-left: 0;
  }
}
</style>
