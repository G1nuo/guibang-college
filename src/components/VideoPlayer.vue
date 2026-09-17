<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { formatTime } from '../utils/format'
import { createPlayerCanvasStream, type DemoStreamHandle } from '../utils/demoStream'

const props = defineProps<{
  src: string
  poster?: string
  subtitleUrl?: string
  /** 断点续播：上次观看位置（秒） */
  resumeSec?: number
  /** 试看时长（秒），0 表示不限制 */
  trialLimit?: number
}>()

const emit = defineEmits<{
  (e: 'progress', p: { position: number; duration: number }): void
  (e: 'ended'): void
  (e: 'trial-end'): void
}>()

const containerEl = ref<HTMLDivElement>()
const videoEl = ref<HTMLVideoElement>()
const trackEl = ref<TextTrack | null>(null)

const playing = ref(false)
const waiting = ref(false)
const current = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const muted = ref(false)
const rate = ref(1)
const isFull = ref(false)
const subtitleOn = ref(true)
const showControls = ref(true)
const trialStopped = ref(false)

const rates = [0.75, 1, 1.25, 1.5, 2]
let hideTimer: number | undefined
let lastReport = 0

/* 演示模式：外部视频源加载失败时切换为内置 Canvas 演示流 */
const SYNTH_DURATION = 1800
const demoMode = ref(false)
let demoHandle: DemoStreamHandle | null = null

function currentDuration(): number {
  return demoMode.value ? SYNTH_DURATION : duration.value
}

/** 视频源加载失败兜底：切换到 Canvas 演示流，播放器控件照常可用 */
function startDemoStream() {
  if (demoMode.value) return
  const v = videoEl.value
  if (!v) return
  demoMode.value = true
  demoHandle = createPlayerCanvasStream(props.poster)
  v.src = ''
  v.srcObject = demoHandle.stream
  duration.value = SYNTH_DURATION
  v.play().catch(() => undefined)
  ElMessage.warning('外部视频源当前网络不可达，已切换内置演示流，播放 / 全屏 / 倍速等控件可正常体验')
}

const progressPercent = () =>
  duration.value ? (current.value / duration.value) * 100 : 0

function togglePlay() {
  const v = videoEl.value
  if (!v) return
  if (v.paused) v.play().catch(() => undefined)
  else v.pause()
}

function onTimeUpdate() {
  const v = videoEl.value
  if (!v) return
  current.value = v.currentTime
  // 试看拦截
  if (props.trialLimit && !trialStopped.value && v.currentTime >= props.trialLimit) {
    trialStopped.value = true
    v.pause()
    emit('trial-end')
    return
  }
  // 每 5 秒上报一次进度（断点续播数据来源）
  if (v.currentTime - lastReport >= 5) {
    lastReport = v.currentTime
    emit('progress', { position: v.currentTime, duration: currentDuration() })
  }
}

function seek(e: MouseEvent) {
  const v = videoEl.value
  if (!v || !duration.value) return
  // 演示流为直播 MediaStream，不支持拖动进度
  if (demoMode.value) {
    ElMessage.info('演示模式不支持拖动进度，购买后正式课程可自由拖动')
    return
  }
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  v.currentTime = ratio * duration.value
  current.value = v.currentTime
}

function changeVolume() {
  const v = videoEl.value
  if (!v) return
  v.volume = volume.value
  v.muted = muted.value
}

function toggleMute() {
  muted.value = !muted.value
  changeVolume()
}

function changeRate(r: number) {
  rate.value = r
  if (videoEl.value) videoEl.value.playbackRate = r
}

function toggleSubtitle() {
  subtitleOn.value = !subtitleOn.value
  if (trackEl.value) {
    trackEl.value.mode = subtitleOn.value ? 'showing' : 'hidden'
  }
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await containerEl.value?.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
}

function onFsChange() {
  isFull.value = !!document.fullscreenElement
}

/** 键盘快捷键：空格播放/暂停，← → 快退快进，↑ ↓ 音量 */
function onKeydown(e: KeyboardEvent) {
  const v = videoEl.value
  if (!v) return
  if (e.code === 'Space') {
    e.preventDefault()
    togglePlay()
  } else if (e.code === 'ArrowRight') {
    v.currentTime = Math.min(duration.value, v.currentTime + 10)
  } else if (e.code === 'ArrowLeft') {
    v.currentTime = Math.max(0, v.currentTime - 10)
  }
}

function pokeControls() {
  showControls.value = true
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    if (playing.value) showControls.value = false
  }, 2600)
}

function onLoaded() {
  const v = videoEl.value
  if (!v || demoMode.value) return
  if (Number.isFinite(v.duration)) duration.value = v.duration
  v.volume = volume.value
  // 字幕轨道
  const tracks = v.textTracks
  if (tracks.length) {
    trackEl.value = tracks[0]
    trackEl.value.mode = subtitleOn.value ? 'showing' : 'hidden'
  }
  // 断点续播：恢复到上次观看位置
  if (
    props.resumeSec &&
    props.resumeSec > 10 &&
    Number.isFinite(v.duration) &&
    props.resumeSec < v.duration - 10
  ) {
    v.currentTime = props.resumeSec
    current.value = props.resumeSec
    ElMessage.success(`已为你断点续播至 ${formatTime(props.resumeSec)}`)
  }
}

/** 供父组件在购买解锁后调用：重置试看状态 */
function unlock() {
  trialStopped.value = false
}

defineExpose({ unlock })

onMounted(() => {
  document.addEventListener('fullscreenchange', onFsChange)
  // 视频源 10 秒内无有效数据（网络超时但 error 未触发）时主动降级演示流
  window.setTimeout(() => {
    const v = videoEl.value
    if (v && v.readyState < 2 && !demoMode.value) startDemoStream()
  }, 10000)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFsChange)
  window.clearTimeout(hideTimer)
  // 离开页面时最后上报一次进度
  const v = videoEl.value
  if (v && current.value) {
    emit('progress', { position: v.currentTime, duration: currentDuration() })
  }
  demoHandle?.stop()
})
</script>

<template>
  <div
    ref="containerEl"
    class="video-player"
    @mousemove="pokeControls"
    @mouseleave="playing && (showControls = false)"
  >
    <video
      ref="videoEl"
      :src="src"
      :poster="poster"
      playsinline
      preload="metadata"
      @play="playing = true; pokeControls()"
      @pause="playing = false; showControls = true"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
      @waiting="waiting = true"
      @playing="waiting = false"
      @ended="emit('ended')"
      @error="startDemoStream"
      @click="togglePlay"
      @keydown="onKeydown"
    >
      <track
        v-if="subtitleUrl"
        kind="subtitles"
        srclang="zh"
        label="中文字幕"
        :src="subtitleUrl"
        default
      />
    </video>

    <!-- 缓冲 loading -->
    <div v-if="waiting" class="loading-mask">
      <el-icon class="spin"><Loading /></el-icon>
    </div>

    <!-- 控制条 -->
    <div class="controls" :class="{ hide: !showControls }">
      <!-- 进度条 -->
      <div class="progress-bar" @click="seek">
        <div class="played" :style="{ width: progressPercent() + '%' }">
          <span class="dot"></span>
        </div>
      </div>

      <div class="ctrl-row">
        <div class="ctrl-left">
          <button class="ctrl-btn" @click="togglePlay">
            <el-icon v-if="!playing"><VideoPlay /></el-icon>
            <el-icon v-else><VideoPause /></el-icon>
          </button>
          <span class="time">
            {{ formatTime(current) }} / {{ formatTime(duration) }}
          </span>
        </div>

        <div class="ctrl-right">
          <!-- 倍速 -->
          <el-dropdown trigger="click" @command="changeRate">
            <button class="ctrl-btn rate-btn">
              {{ rate === 1 ? '倍速' : rate + 'x' }}
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="r in rates"
                  :key="r"
                  :command="r"
                  :class="{ 'is-active': r === rate }"
                >
                  {{ r }}x 倍速
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 字幕（演示流无字幕轨，隐藏） -->
          <button
            v-if="subtitleUrl && !demoMode"
            class="ctrl-btn"
            :class="{ off: !subtitleOn }"
            title="字幕开关"
            @click="toggleSubtitle"
          >
            <el-icon><Document /></el-icon>
          </button>

          <!-- 音量 -->
          <button class="ctrl-btn" @click="toggleMute">
            <el-icon v-if="muted || volume === 0"><Mute /></el-icon>
            <el-icon v-else><Microphone /></el-icon>
          </button>
          <input
            v-model.number="volume"
            class="volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            @input="changeVolume"
          />

          <!-- 全屏 -->
          <button class="ctrl-btn" @click="toggleFullscreen">
            <el-icon v-if="!isFull"><FullScreen /></el-icon>
            <el-icon v-else><Aim /></el-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--gg-radius);
  overflow: hidden;
  outline: none;
}

video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-mask {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.spin {
  font-size: 42px;
  color: #fff;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 26px 14px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.72));
  transition: opacity 0.25s;
}

.controls.hide {
  opacity: 0;
  pointer-events: none;
}

.progress-bar {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  margin-bottom: 8px;
}

.played {
  position: relative;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--gg-primary), #6d93e8);
}

.dot {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
}

.ctrl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ctrl-left,
.ctrl-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ctrl-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  transition: background 0.2s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.ctrl-btn.off {
  opacity: 0.45;
}

.rate-btn {
  font-size: 14px;
  min-width: 44px;
  justify-content: center;
}

.time {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.volume {
  width: 70px;
  accent-color: var(--gg-primary);
  cursor: pointer;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--gg-primary);
  font-weight: 700;
}

:deep(video::cue) {
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 15px;
}
</style>
