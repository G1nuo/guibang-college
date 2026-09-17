<script setup lang="ts">
import { useRouter } from 'vue-router'
import { courseApi } from '../api'
import { formatCount } from '../utils/format'
import { onImgError } from '../utils/image'

const router = useRouter()
const teachers = courseApi.teachers()

function viewCourses(teacherName: string) {
  router.push({ path: '/courses', query: { keyword: teacherName } })
}
</script>

<template>
  <!-- 板块二：教师资源 -->
  <section class="gg-section teacher-section">
    <div class="gg-container">
      <div class="gg-section-head">
        <div>
          <h2 class="gg-section-title">名师天团</h2>
          <p class="gg-section-sub">来自一线大厂与高校的资深讲师，把真功夫带进课堂</p>
        </div>
      </div>

      <div class="teacher-grid">
        <div
          v-for="t in teachers"
          :key="t.id"
          class="teacher-card"
          @click="viewCourses(t.name)"
        >
          <div class="avatar-wrap">
            <img :src="t.cover" :alt="t.name" loading="lazy" @error="onImgError" />
            <span class="org">{{ t.org }}</span>
          </div>
          <h3>{{ t.name }}</h3>
          <p class="title-line">{{ t.title }}</p>
          <div class="tags">
            <span v-for="tag in t.tags" :key="tag" class="gg-tag gg-tag-gold">
              {{ tag }}
            </span>
          </div>
          <p class="intro">{{ t.intro }}</p>
          <div class="stats">
            <span><strong>{{ formatCount(t.studentCount) }}</strong> 学员</span>
            <span><strong>{{ t.courseCount }}</strong> 门课</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.teacher-section {
  background: #fff;
}

.teacher-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.teacher-card {
  position: relative;
  background: var(--gg-bg);
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius-lg);
  padding: 26px 22px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.28s ease;
}

.teacher-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--gg-shadow-hover);
  border-color: transparent;
  background: #fff;
}

.avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 14px;
}

.avatar-wrap img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 6px 18px rgba(43, 86, 182, 0.22);
}

.org {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, var(--gg-primary), var(--gg-gold));
}

.teacher-card h3 {
  font-size: 18px;
  font-weight: 800;
}

.title-line {
  font-size: 13px;
  color: var(--gg-primary);
  margin: 4px 0 10px;
}

.tags {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.intro {
  font-size: 12.5px;
  color: var(--gg-ink-3);
  line-height: 1.7;
  height: 64px;
  overflow: hidden;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.stats {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--gg-line);
  display: flex;
  justify-content: center;
  gap: 26px;
  font-size: 13px;
  color: var(--gg-ink-3);
}

.stats strong {
  color: var(--gg-ink);
  font-size: 16px;
  margin-right: 2px;
}

@media (max-width: 900px) {
  .teacher-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .teacher-grid {
    grid-template-columns: 1fr;
  }
}
</style>
