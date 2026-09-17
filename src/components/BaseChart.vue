<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * ECharts 通用封装：
 * 统一处理 初始化 / option 更新 / resize / 销毁，避免内存泄漏。
 * ResizeObserver 保证容器在隐藏面板（如 el-tab-pane）中初次挂载时
 * 尺寸为 0，面板显示后图表也能自动补绘。
 */
const props = defineProps<{
  option: echarts.EChartsOption
  height?: string
}>()

const el = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let ro: ResizeObserver | null = null

function resize() {
  chart?.resize()
}

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  chart.setOption(props.option)
  window.addEventListener('resize', resize)
  // 容器尺寸变化（含从 display:none 变为可见）时自动 resize
  ro = new ResizeObserver(() => {
    const w = el.value?.clientWidth ?? 0
    const h = el.value?.clientHeight ?? 0
    if (w > 0 && h > 0) chart?.resize()
  })
  ro.observe(el.value)
})

watch(
  () => props.option,
  (val) => {
    chart?.setOption(val, true)
  },
  { deep: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  ro?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" class="base-chart" :style="{ height: height ?? '320px' }"></div>
</template>

<style scoped>
.base-chart {
  width: 100%;
}
</style>
