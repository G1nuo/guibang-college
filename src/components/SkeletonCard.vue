<template>
  <!-- 课程卡片骨架屏：数据加载时展示 -->
  <div class="skeleton-card">
    <div class="gg-skeleton cover-sk"></div>
    <div class="body-sk">
      <div class="gg-skeleton tag-sk"></div>
      <div class="gg-skeleton line-sk w-90"></div>
      <div class="gg-skeleton line-sk w-60"></div>
      <div class="gg-skeleton meta-sk"></div>
      <div class="gg-skeleton price-sk"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--gg-card);
  border-radius: var(--gg-radius);
  border: 1px solid var(--gg-line);
  overflow: hidden;
}

.cover-sk {
  aspect-ratio: 16 / 9;
  border-radius: 0;
}

.body-sk {
  padding: 14px 16px 16px;
}

.tag-sk {
  width: 70px;
  height: 22px;
  margin-bottom: 12px;
}

.line-sk {
  height: 14px;
  margin-bottom: 10px;
}

.w-90 {
  width: 90%;
}

.w-60 {
  width: 60%;
}

.meta-sk {
  height: 12px;
  width: 80%;
  margin: 16px 0 12px;
}

.price-sk {
  height: 22px;
  width: 40%;
}
</style>
