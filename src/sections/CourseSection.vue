<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { courseApi } from '../api'
import type { Course } from '../types'
import CourseCard from '../components/CourseCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'

const router = useRouter()
const list = ref<Course[]>([])
const loading = ref(true)
const activeCat = ref('全部')
const cats = courseApi.categories()

async function load(cat: string) {
  loading.value = true
  const res = await courseApi.list({ category: cat, sort: 'hot', page: 1, pageSize: 8 })
  list.value = res.list
  loading.value = false
}

onMounted(() => load('全部'))

function pickCat(cat: string) {
  activeCat.value = cat
  load(cat)
}
</script>

<template>
  <!-- 板块三：精选课程 -->
  <section class="gg-section course-section">
    <div class="gg-container">
      <div class="gg-section-head">
        <div>
          <h2 class="gg-section-title">精选好课</h2>
          <p class="gg-section-sub">覆盖前端、后端、AI、设计、考证与职场，学练测评一站完成</p>
        </div>
        <span class="gg-more" @click="router.push('/courses')">查看全部课程 →</span>
      </div>

      <div class="cat-tabs">
        <button
          v-for="c in cats"
          :key="c"
          class="cat-btn"
          :class="{ active: activeCat === c }"
          @click="pickCat(c)"
        >
          {{ c }}
        </button>
      </div>

      <div class="course-grid">
        <template v-if="loading">
          <SkeletonCard v-for="i in 4" :key="i" />
        </template>
        <template v-else>
          <CourseCard v-for="c in list" :key="c.id" :course="c" />
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.cat-btn {
  padding: 7px 20px;
  border-radius: 18px;
  border: 1px solid var(--gg-line);
  background: #fff;
  font-size: 14px;
  color: var(--gg-ink-2);
  cursor: pointer;
  transition: all 0.2s;
}

.cat-btn:hover {
  border-color: var(--gg-primary);
  color: var(--gg-primary);
}

.cat-btn.active {
  color: #fff;
  background: linear-gradient(135deg, var(--gg-primary), var(--gg-primary-deep));
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(43, 86, 182, 0.3);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
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
}
</style>
