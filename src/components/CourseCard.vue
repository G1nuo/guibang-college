<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Course } from '../types'
import { formatCount } from '../utils/format'
import { onImgError } from '../utils/image'
import { courseApi } from '../api'

const props = defineProps<{ course: Course }>()
const router = useRouter()
const teacher = computed(() => courseApi.teacherOf(props.course.teacherId))

function goDetail() {
  router.push(`/course/${props.course.id}`)
}
</script>

<template>
  <div class="course-card" @click="goDetail">
    <div class="cover">
      <img :src="course.cover" :alt="course.title" loading="lazy" @error="onImgError" />
      <span v-if="course.hot" class="badge badge-hot">🔥 热门</span>
      <span v-else-if="course.isNew" class="badge badge-new">✨ 新课</span>
      <span class="badge badge-level">{{ course.level }}</span>
    </div>
    <div class="body">
      <div class="tags">
        <span v-for="t in course.tags.slice(0, 2)" :key="t" class="gg-tag">{{ t }}</span>
      </div>
      <h3 class="title" :title="course.title">{{ course.title }}</h3>
      <p class="teacher">
        <el-icon><Avatar /></el-icon>{{ teacher?.name }} · {{ course.duration }}
      </p>
      <div class="meta">
        <span class="rating">
          <el-icon><Star /></el-icon>{{ course.rating.toFixed(1) }}
        </span>
        <span class="students">{{ formatCount(course.students) }}人在学</span>
      </div>
      <div class="foot">
        <div class="price">
          <span class="now">¥{{ course.price }}</span>
          <span v-if="course.originalPrice" class="old">¥{{ course.originalPrice }}</span>
        </div>
        <span class="go">立即学习 →</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-card {
  background: var(--gg-card);
  border-radius: var(--gg-radius);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--gg-line);
  transition: all 0.28s ease;
}

.course-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--gg-shadow-hover);
  border-color: transparent;
}

.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--gg-bg-2);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.course-card:hover .cover img {
  transform: scale(1.06);
}

.badge {
  position: absolute;
  top: 10px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  backdrop-filter: blur(4px);
}

.badge-hot {
  left: 10px;
  background: rgba(226, 93, 88, 0.92);
}

.badge-new {
  left: 10px;
  background: rgba(47, 169, 114, 0.92);
}

.badge-level {
  right: 10px;
  background: rgba(29, 63, 143, 0.72);
}

.body {
  padding: 14px 16px 16px;
}

.tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.teacher {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--gg-ink-3);
  margin-bottom: 10px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: var(--gg-ink-3);
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--gg-line);
}

.rating {
  display: flex;
  align-items: center;
  gap: 3px;
  color: var(--gg-gold);
  font-weight: 700;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

.now {
  color: var(--gg-danger);
  font-size: 19px;
  font-weight: 800;
}

.old {
  margin-left: 6px;
  font-size: 12px;
  color: var(--gg-ink-3);
  text-decoration: line-through;
}

.go {
  font-size: 13px;
  color: var(--gg-primary);
  font-weight: 600;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s;
}

.course-card:hover .go {
  opacity: 1;
  transform: translateX(0);
}
</style>
