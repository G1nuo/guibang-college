<script setup lang="ts">
import PromoCarousel from '../sections/PromoCarousel.vue'
import TeacherSection from '../sections/TeacherSection.vue'
import CourseSection from '../sections/CourseSection.vue'
import StatsSection from '../sections/StatsSection.vue'
</script>

<template>
  <div class="home">
    <!-- 第一板块：优惠活动滚动 -->
    <PromoCarousel />
    <!-- 第二板块：教师资源 -->
    <TeacherSection />
    <!-- 第三板块：课程板块 -->
    <CourseSection />
    <!-- 平台统计（ECharts） -->
    <StatsSection />
  </div>
</template>
