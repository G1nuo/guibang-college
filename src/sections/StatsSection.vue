<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '../components/BaseChart.vue'
import { statsApi, type StatsOverview } from '../api'
import { formatCount } from '../utils/format'

const data = ref<StatsOverview | null>(null)

const growthOption = ref<EChartsOption>({})
const pieOption = ref<EChartsOption>({})

function buildCharts(d: StatsOverview) {
  growthOption.value = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: d.userGrowth.map((x) => x.month),
      axisLine: { lineStyle: { color: '#c7d0e0' } },
      axisLabel: { color: '#8a94a6' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef1f7' } },
      axisLabel: { color: '#8a94a6' }
    },
    series: [
      {
        name: '新增注册用户',
        type: 'bar',
        data: d.userGrowth.map((x) => x.count),
        barWidth: 22,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3a6fd8' },
              { offset: 1, color: '#95aadd' }
            ]
          }
        },
        label: { show: true, position: 'top', color: '#2b56b6', fontWeight: 600 }
      },
      {
        name: '增长趋势',
        type: 'line',
        smooth: true,
        data: d.userGrowth.map((x) => x.count),
        symbolSize: 7,
        lineStyle: { width: 3, color: '#c99b3c' },
        itemStyle: { color: '#c99b3c' }
      }
    ]
  }

  pieOption.value = {
    tooltip: { trigger: 'item', formatter: '{b}<br/>学习人次：{c}（{d}%）' },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { color: '#4a5568', fontSize: 12 }
    },
    color: ['#2b56b6', '#c99b3c', '#8b5cf6', '#2fa972', '#ef9b3a', '#e25d58'],
    series: [
      {
        name: '课程学习人次',
        type: 'pie',
        radius: ['42%', '66%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 6 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 15, fontWeight: 'bold' }
        },
        data: d.categoryDist
      }
    ]
  }
}

onMounted(async () => {
  data.value = await statsApi.overview()
  buildCharts(data.value)
})
</script>

<template>
  <section class="gg-section stats-section">
    <div class="gg-container">
      <div class="gg-section-head">
        <div>
          <h2 class="gg-section-title">平台数据</h2>
          <p class="gg-section-sub">用户账户实时录入统计 · 数据来源：平台后端数据库</p>
        </div>
      </div>

      <!-- 数字概览 -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="icon" style="background: #eaf0fe; color: #2b56b6">
            <el-icon><User /></el-icon>
          </div>
          <div>
            <strong>{{ data ? formatCount(data.totalUsers) : '—' }}</strong>
            <span>注册用户</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="icon" style="background: #fbf3e2; color: #c99b3c">
            <el-icon><Reading /></el-icon>
          </div>
          <div>
            <strong>{{ data?.totalCourses ?? '—' }}</strong>
            <span>精品课程</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="icon" style="background: #e7f7f0; color: #2fa972">
            <el-icon><Avatar /></el-icon>
          </div>
          <div>
            <strong>{{ data?.totalTeachers ?? '—' }}</strong>
            <span>认证讲师</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="icon" style="background: #fdeeee; color: #e25d58">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div>
            <strong>{{ data ? formatCount(data.totalLearning) : '—' }}</strong>
            <span>累计学习人次</span>
          </div>
        </div>
      </div>

      <!-- 图表 -->
      <div class="chart-grid">
        <div class="chart-card">
          <h3>近 7 个月用户注册趋势</h3>
          <BaseChart :option="growthOption" height="300px" />
        </div>
        <div class="chart-card">
          <h3>各分类课程学习人次占比</h3>
          <BaseChart :option="pieOption" height="300px" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-section {
  background: linear-gradient(180deg, #fff 0%, var(--gg-bg) 100%);
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  padding: 20px 22px;
  transition: all 0.25s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gg-shadow);
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.stat-card strong {
  display: block;
  font-size: 26px;
  font-weight: 800;
  color: var(--gg-ink);
  line-height: 1.2;
}

.stat-card span {
  font-size: 13px;
  color: var(--gg-ink-3);
}

.chart-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
}

.chart-card {
  background: #fff;
  border: 1px solid var(--gg-line);
  border-radius: var(--gg-radius);
  padding: 20px 22px 8px;
}

.chart-card h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}

@media (max-width: 900px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
