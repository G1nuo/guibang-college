<script setup lang="ts">
import { useRouter } from 'vue-router'
import { promos } from '../data/catalog'
import { onImgError } from '../utils/image'

const router = useRouter()

function onCta(id: number) {
  if (id === 2) router.push('/live/1')
  else router.push('/courses')
}
</script>

<template>
  <!-- 板块一：优惠活动滚动模块 -->
  <section class="promo-section">
    <el-carousel
      height="400px"
      :interval="4200"
      arrow="hover"
      indicator-position="outside"
      class="promo-carousel"
    >
      <el-carousel-item v-for="p in promos" :key="p.id">
        <div class="slide" :style="{ background: p.color }">
          <div class="gg-container slide-inner">
            <div class="slide-text">
              <span class="kicker">{{ p.kicker }}</span>
              <h2>{{ p.title }}</h2>
              <p>{{ p.desc }}</p>
              <button class="gg-btn gg-btn-gold" @click="onCta(p.id)">
                {{ p.id === 2 ? '预约直播' : '立即抢购' }}
              </button>
            </div>
            <div class="slide-img">
              <img :src="p.image" :alt="p.title" @error="onImgError" />
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<style scoped>
.promo-section {
  padding: 20px 0 0;
}

.promo-carousel {
  border-radius: var(--gg-radius-lg);
  overflow: hidden;
}

.slide {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 15% 20%,
      rgba(255, 255, 255, 0.14),
      transparent 45%
    ),
    radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.1), transparent 40%);
}

.slide-inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.slide-text {
  flex: 1;
  color: #fff;
  z-index: 2;
}

.kicker {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 13px;
  letter-spacing: 2px;
  margin-bottom: 18px;
}

.slide-text h2 {
  font-size: 38px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 16px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

.slide-text p {
  font-size: 16px;
  line-height: 1.8;
  opacity: 0.92;
  margin-bottom: 28px;
  max-width: 480px;
}

.slide-img {
  flex: 0 0 44%;
  z-index: 1;
}

.slide-img img {
  width: 100%;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  transform: rotate(1.5deg);
}

:deep(.el-carousel__indicators) {
  bottom: 14px;
}

:deep(.el-carousel__button) {
  width: 22px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.55);
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background: #fff;
}

@media (max-width: 768px) {
  .promo-carousel {
    height: 320px !important;
  }
  .slide-text h2 {
    font-size: 24px;
  }
  .slide-img {
    display: none;
  }
}
</style>
