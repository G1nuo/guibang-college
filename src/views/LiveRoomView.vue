<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'
import type { ChatMessage, LiveMember } from '../types'
import { courseApi } from '../api'
import { createTeacherCanvasStream, type DemoStreamHandle } from '../utils/demoStream'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/* 房间标题（根据路由课程 id 推断） */
const courseId = Number(route.params.id ?? 1)
const roomTitle = courseApi.all().find((c) => c.id === courseId)?.title
  ?? '大模型应用开发 · 直播答疑课'
const teacherName = '周彦舟'

/* ===== 媒体元素引用 ===== */
const teacherVideo = ref<HTMLVideoElement>() // 老师共享画面（源）
const remoteVideo = ref<HTMLVideoElement>() // WebRTC 对端渲染
const selfVideo = ref<HTMLVideoElement>() // 本地摄像头

/* ===== 状态 ===== */
const rightTab = ref<'members' | 'chat'>('chat')
const connState = ref<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>(
  'connecting'
)
const reconnectTip = ref('')
const selfMicOn = ref(true)
const selfCamOn = ref(true)
const cameraReady = ref(false)
const speakingId = ref<number>(1)
const chatInput = ref('')
const chatBox = ref<HTMLDivElement>()
const msgSeq = ref(100)

let localStream: MediaStream | null = null
let teacherStream: MediaStream | null = null
let pc1: RTCPeerConnection | null = null
let pc2: RTCPeerConnection | null = null
let speakTimer: number
let reconnectTimer: number

/* ===== 成员列表（含自己） ===== */
const members = ref<LiveMember[]>([
  { id: 1, name: teacherName, role: 'teacher', micOn: true, camOn: true, color: '#8b5cf6' },
  { id: 2, name: '王浩然', role: 'student', micOn: true, camOn: false, color: '#2fa972' },
  { id: 3, name: '张欣怡', role: 'student', micOn: false, camOn: false, color: '#ef9b3a' },
  { id: 4, name: '刘子涵', role: 'student', micOn: true, camOn: true, color: '#e25d58' },
  { id: 999, name: userStore.nickname, role: 'student', micOn: true, camOn: true, color: userStore.user?.avatarColor ?? '#2b56b6' }
])

const selfMember = members.value.find((m) => m.id === 999)!

/* ===== 聊天消息 ===== */
const messages = ref<ChatMessage[]>([
  { id: 1, name: '系统', content: '欢迎进入直播间，请遵守课堂纪律～', time: now() },
  { id: 2, name: teacherName, content: '同学们晚上好，今天讲 RAG 知识库的搭建，有问题随时在聊天区提问。', time: now(), teacher: true },
  { id: 3, name: '王浩然', content: '老师好！向量数据库用哪个比较好上手？', time: now() },
  { id: 4, name: teacherName, content: '入门推荐 Chroma，生产环境可以看 Milvus。', time: now(), teacher: true }
])

function now() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function pushMsg(name: string, content: string, extra?: Partial<ChatMessage>) {
  messages.value.push({ id: ++msgSeq.value, name, content, time: now(), ...extra })
}

/* 新消息自动滚动到底部 */
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
)

/* ================= WebRTC 连接 ================= */

function captureTeacherStream() {
  const v = teacherVideo.value
  if (!v) return null
  // captureStream 属于 WebRTC MediaStream 体系：把老师共享画面转为可推流的 MediaStream
  const stream = (v as HTMLVideoElement & {
    captureStream?: (fps?: number) => MediaStream
    mozCaptureStream?: (fps?: number) => MediaStream
  }).captureStream
    ? (v as HTMLVideoElement & { captureStream: (fps?: number) => MediaStream }).captureStream(30)
    : (v as unknown as { mozCaptureStream: (fps?: number) => MediaStream }).mozCaptureStream(30)
  return stream
}

let demoHandle: DemoStreamHandle | null = null
let peerStarted = false

/**
 * 准备老师媒体源：
 * 优先使用真实视频 captureStream；若视频 CDN 8 秒内不可达，
 * 降级为 Canvas 演示流（同样是标准 MediaStream，WebRTC 管线照常工作）。
 */
async function initTeacherMedia() {
  const v = teacherVideo.value
  const ready = await new Promise<boolean>((resolve) => {
    if (!v) return resolve(false)
    if (v.readyState >= 2) return resolve(true)
    const done = (ok: boolean) => {
      window.clearTimeout(timer)
      resolve(ok)
    }
    const timer = window.setTimeout(() => done(false), 8000)
    v.addEventListener('loadeddata', () => done(true), { once: true })
    v.addEventListener('error', () => done(false), { once: true })
  })

  if (ready && v) {
    const s = captureTeacherStream()
    if (s) teacherStream = s
  }
  if (!teacherStream) {
    demoHandle = createTeacherCanvasStream(roomTitle)
    teacherStream = demoHandle.stream
    pushMsg('系统', '检测到外部画面源加载超时，已切换内置共享画面演示流')
  }
  if (!peerStarted) {
    peerStarted = true
    connectPeer()
  }
}

/**
 * 建立 WebRTC 连接：
 * 页面内构造一对 RTCPeerConnection（本端 pc1 / 对端 pc2），
 * 手动交换 SDP 与 ICE candidate，模拟真实的 P2P 媒体协商过程。
 */
async function connectPeer() {
  if (typeof RTCPeerConnection === 'undefined') {
    // 极端兜底：不支持 WebRTC 时直接显示源视频
    if (remoteVideo.value && teacherVideo.value) {
      remoteVideo.value.srcObject = teacherStream
    }
    connState.value = 'connected'
    return
  }

  connState.value = 'connecting'

  pc1 = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  pc2 = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })

  // 交换 ICE candidate
  pc1.onicecandidate = (e) => e.candidate && pc2?.addIceCandidate(e.candidate).catch(() => {})
  pc2.onicecandidate = (e) => e.candidate && pc1?.addIceCandidate(e.candidate).catch(() => {})

  // 对端收到媒体流 -> 渲染到舞台
  pc2.ontrack = (e) => {
    if (remoteVideo.value) {
      remoteVideo.value.srcObject = e.streams[0]
    }
  }

  // 真实连接状态回调
  pc1.onconnectionstatechange = () => {
    const s = pc1?.connectionState
    if (s === 'connected') {
      connState.value = 'connected'
      if (reconnectTip.value) {
        reconnectTip.value = '网络已恢复，重连成功'
        setTimeout(() => (reconnectTip.value = ''), 2200)
      }
    } else if (s === 'failed' || s === 'disconnected') {
      if (connState.value !== 'reconnecting') {
        connState.value = 'disconnected'
        triggerReconnect(false)
      }
    }
  }

  // 把老师共享画面的音视频轨道加入本端连接
  if (!teacherStream) teacherStream = captureTeacherStream()
  teacherStream?.getTracks().forEach((track) => {
    if (teacherStream && pc1) pc1.addTrack(track, teacherStream)
  })

  // SDP  offer/answer 协商
  const offer = await pc1.createOffer()
  await pc1.setLocalDescription(offer)
  await pc2.setRemoteDescription(offer)
  const answer = await pc2.createAnswer()
  await pc2.setLocalDescription(answer)
  await pc1.setRemoteDescription(answer)
}

function teardownPeer() {
  pc1?.close()
  pc2?.close()
  pc1 = null
  pc2 = null
  if (remoteVideo.value) remoteVideo.value.srcObject = null
}

/** 断线重连（手动模拟 / 状态异常触发） */
function triggerReconnect(manual = true) {
  if (connState.value === 'reconnecting') return
  connState.value = 'reconnecting'
  reconnectTip.value = ''
  pushMsg('系统', manual ? '检测到网络波动，连接已断开，正在尝试重连…' : '连接异常，正在自动重连…')
  teardownPeer()
  window.clearTimeout(reconnectTimer)
  reconnectTimer = window.setTimeout(async () => {
    try {
      await connectPeer()
      pushMsg('系统', '重连成功，欢迎回到课堂')
    } catch {
      ElMessage.error('重连失败，请刷新页面重试')
      connState.value = 'disconnected'
    }
  }, 2800)
}

/* ================= 本地摄像头（getUserMedia） ================= */

async function startLocalCamera() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 360 } },
      audio: true
    })
    if (selfVideo.value) selfVideo.value.srcObject = localStream
    cameraReady.value = true
  } catch {
    // 无摄像头 / 拒绝授权：显示占位头像，按钮仍可演示状态切换
    cameraReady.value = false
    selfCamOn.value = false
    selfMember.camOn = false
    ElMessage.info('未检测到摄像头，已为你使用旁听模式（音视频设备占位）')
  }
}

/** 静音 / 取消静音（操作真实音频轨道） */
function toggleMic() {
  selfMicOn.value = !selfMicOn.value
  localStream?.getAudioTracks().forEach((t) => (t.enabled = selfMicOn.value))
  selfMember.micOn = selfMicOn.value
  ElMessage.success(selfMicOn.value ? '已取消静音' : '已静音')
}

/** 开 / 关摄像头（操作真实视频轨道） */
function toggleCam() {
  selfCamOn.value = !selfCamOn.value
  localStream?.getVideoTracks().forEach((t) => (t.enabled = selfCamOn.value))
  selfMember.camOn = selfCamOn.value
  ElMessage.success(selfCamOn.value ? '摄像头已开启' : '摄像头已关闭')
}

/* ================= 聊天 ================= */

function sendChat() {
  const content = chatInput.value.trim()
  if (!content) return
  pushMsg(userStore.nickname, content, { self: true })
  chatInput.value = ''
  // 模拟同学 / 老师回复
  window.setTimeout(() => {
    const replies = [
      { name: teacherName, teacher: true, text: '好问题！这个点课后我整理到课件里发给大家。' },
      { name: '张欣怡', text: '我也有同样的疑问，蹲一个解答 👀' },
      { name: '王浩然', text: '楼上说得对，刚才那一段我回看了录播，讲得很清楚。' }
    ]
    const r = replies[Math.floor(Math.random() * replies.length)]
    pushMsg(r.name, r.text, { teacher: r.teacher })
  }, 1200 + Math.random() * 800)
}

/* ================= 模拟课堂氛围：随机“正在发言”高亮 ================= */

function startSpeakLoop() {
  speakTimer = window.setInterval(() => {
    if (connState.value !== 'connected') return
    const ids = members.value.filter((m) => m.micOn).map((m) => m.id)
    speakingId.value = ids[Math.floor(Math.random() * ids.length)]
  }, 1600)
}

async function leaveRoom() {
  try {
    await ElMessageBox.confirm('确定要离开直播课堂吗？', '离开提示', {
      confirmButtonText: '离开',
      cancelButtonText: '继续听课',
      type: 'warning'
    })
    router.push('/')
  } catch {
    /* 取消 */
  }
}

onMounted(async () => {
  startSpeakLoop()
  await startLocalCamera()
  // 准备老师媒体源（真实视频优先，失败则 Canvas 演示流兜底）并推流
  initTeacherMedia()
})

onBeforeUnmount(() => {
  window.clearInterval(speakTimer)
  window.clearTimeout(reconnectTimer)
  teardownPeer()
  localStream?.getTracks().forEach((t) => t.stop())
  demoHandle?.stop()
  teacherStream?.getTracks().forEach((t) => t.stop())
})
</script>

<template>
  <div class="live-room">
    <!-- 顶栏 -->
    <header class="live-header">
      <div class="room-info">
        <span class="live-dot"></span>
        <strong>直播中</strong>
        <span class="room-title">{{ roomTitle }}</span>
      </div>
      <div class="room-right">
        <span class="conn-pill" :class="connState">
          <el-icon class="spin" v-if="connState === 'reconnecting' || connState === 'connecting'">
            <Loading />
          </el-icon>
          <el-icon v-else><Connection /></el-icon>
          {{
            { connecting: '正在连接…', connected: 'WebRTC 已连接', reconnecting: '断线重连中…', disconnected: '连接已断开' }[connState]
          }}
        </span>
        <el-button size="small" round @click="triggerReconnect(true)">模拟网络波动</el-button>
        <el-button size="small" type="danger" round @click="leaveRoom">离开课堂</el-button>
      </div>
    </header>

    <div class="live-body">
      <!-- 左侧舞台 -->
      <section class="stage">
        <!-- 老师共享画面（经 WebRTC 对端渲染） -->
        <div class="teacher-tile">
          <video
            ref="remoteVideo"
            autoplay
            playsinline
            class="remote-video"
          ></video>
          <!-- 老师源画面（隐藏，仅作为 captureStream 来源；加载失败时自动切换 Canvas 演示流） -->
          <video
            ref="teacherVideo"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
            autoplay
            muted
            loop
            playsinline
            class="hidden-source"
          ></video>

          <div class="tile-label teacher-label">
            <el-icon><Microphone /></el-icon> {{ teacherName }}（讲师共享屏幕）
          </div>

          <!-- 断线重连遮罩 -->
          <div v-if="connState === 'reconnecting' || connState === 'disconnected'" class="reconnect-mask">
            <el-icon class="big-spin"><Loading /></el-icon>
            <p>{{ reconnectTip || '网络连接已断开，正在尝试重连…' }}</p>
            <span>系统将在网络恢复后自动重新连接</span>
          </div>
        </div>

        <!-- 其他学员小窗（模拟） -->
        <div class="member-tiles">
          <div
            v-for="m in members.filter((x) => x.role === 'student' && x.id !== 999).slice(0, 3)"
            :key="m.id"
            class="mini-tile"
            :class="{ speaking: speakingId === m.id }"
          >
            <div class="mini-avatar" :style="{ background: m.color }">
              {{ m.name.slice(0, 1) }}
            </div>
            <span class="mini-name">{{ m.name }}</span>
            <span class="mini-status">
              <el-icon v-if="!m.micOn" class="off"><Mute /></el-icon>
              <el-icon v-else class="on"><Microphone /></el-icon>
              <el-icon v-if="!m.camOn" class="off"><VideoPause /></el-icon>
              <el-icon v-else class="on"><VideoCamera /></el-icon>
            </span>
          </div>
        </div>

        <!-- 本人画面 PiP -->
        <div class="self-tile" :class="{ speaking: speakingId === 999 }">
          <video ref="selfVideo" autoplay playsinline muted v-show="cameraReady && selfCamOn"></video>
          <div v-if="!cameraReady || !selfCamOn" class="self-placeholder" :style="{ background: selfMember.color }">
            {{ userStore.nickname.slice(0, 1) }}
          </div>
          <span class="tile-label">
            <el-icon><Microphone v-if="selfMicOn" /><Mute v-else /></el-icon>
            我（{{ selfCamOn ? '摄像头开' : '摄像头关' }}）
          </span>
        </div>
      </section>

      <!-- 右侧：成员 / 聊天 -->
      <aside class="side-panel">
        <div class="panel-tabs">
          <button :class="{ active: rightTab === 'chat' }" @click="rightTab = 'chat'">
            聊天区 <span class="dot-badge">{{ messages.length }}</span>
          </button>
          <button :class="{ active: rightTab === 'members' }" @click="rightTab = 'members'">
            成员列表 <span class="count">{{ members.length }}</span>
          </button>
        </div>

        <!-- 聊天 -->
        <div v-show="rightTab === 'chat'" class="chat-pane">
          <div ref="chatBox" class="chat-list">
            <div
              v-for="m in messages"
              :key="m.id"
              class="chat-msg"
              :class="{ self: m.self, system: m.name === '系统' }"
            >
              <template v-if="m.name === '系统'">
                <p class="sys-line">{{ m.content }}</p>
              </template>
              <template v-else>
                <span class="msg-name" :class="{ teacher: m.teacher }">
                  {{ m.teacher ? '👨‍🏫 ' : '' }}{{ m.name }}
                </span>
                <p class="msg-bubble">{{ m.content }}</p>
                <span class="msg-time">{{ m.time }}</span>
              </template>
            </div>
          </div>
          <div class="chat-input">
            <el-input
              v-model="chatInput"
              type="textarea"
              :rows="2"
              resize="none"
              placeholder="输入消息，Enter 发送 / Shift+Enter 换行"
              @keyup.enter.exact.prevent="sendChat"
            />
            <el-button type="primary" round size="small" @click="sendChat">发送</el-button>
          </div>
        </div>

        <!-- 成员列表 -->
        <div v-show="rightTab === 'members'" class="members-pane">
          <div
            v-for="m in members"
            :key="m.id"
            class="member-row"
            :class="{ speaking: speakingId === m.id }"
          >
            <el-avatar :size="38" :style="{ background: m.color }">
              {{ m.name.slice(0, 1) }}
            </el-avatar>
            <div class="member-info">
              <span class="member-name">
                {{ m.name }}
                <el-tag v-if="m.role === 'teacher'" size="small" type="warning">讲师</el-tag>
                <el-tag v-else-if="m.id === 999" size="small" type="primary">我</el-tag>
              </span>
              <span class="speaking-text">
                {{ speakingId === m.id && m.micOn ? '正在发言…' : m.micOn ? '麦克风开启' : '已静音' }}
              </span>
            </div>
            <span class="member-ctrls">
              <el-icon :class="m.micOn ? 'ic-on' : 'ic-off'">
                <Microphone v-if="m.micOn" /><Mute v-else />
              </el-icon>
              <el-icon :class="m.camOn ? 'ic-on' : 'ic-off'">
                <VideoCamera v-if="m.camOn" /><VideoPause v-else />
              </el-icon>
            </span>
          </div>
        </div>
      </aside>
    </div>

    <!-- 底部工具栏 -->
    <footer class="live-toolbar">
      <button class="tool-btn" :class="{ danger: !selfMicOn }" @click="toggleMic">
        <el-icon><Microphone v-if="selfMicOn" /><Mute v-else /></el-icon>
        {{ selfMicOn ? '静音' : '取消静音' }}
      </button>
      <button class="tool-btn" :class="{ danger: !selfCamOn }" @click="toggleCam">
        <el-icon><VideoCamera v-if="selfCamOn" /><VideoPause v-else /></el-icon>
        {{ selfCamOn ? '关摄像头' : '开摄像头' }}
      </button>
      <button class="tool-btn" @click="triggerReconnect(true)">
        <el-icon><RefreshRight /></el-icon>重连
      </button>
      <button class="tool-btn leave" @click="leaveRoom">
        <el-icon><SwitchButton /></el-icon>挂断离开
      </button>
    </footer>
  </div>
</template>

<style scoped>
.live-room {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e1526;
  color: #e8edf7;
}

/* 顶栏 */
.live-header {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #16203a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.room-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #f04d42;
  animation: blink 1.2s infinite;
}

@keyframes blink {
  50% { opacity: 0.35; }
}

.room-title {
  color: #aab6d0;
  margin-left: 6px;
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.conn-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12.5px;
  background: rgba(47, 169, 114, 0.15);
  color: #58d39a;
}

.conn-pill.connecting,
.conn-pill.reconnecting {
  background: rgba(239, 155, 58, 0.15);
  color: #f4b768;
}

.conn-pill.disconnected {
  background: rgba(240, 77, 66, 0.15);
  color: #f4837c;
}

.spin {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* 主体 */
.live-body {
  flex: 1;
  display: flex;
  gap: 14px;
  padding: 14px;
  min-height: 0;
}

.stage {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.teacher-tile {
  position: relative;
  flex: 1;
  background: #000;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 0;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hidden-source {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.tile-label {
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.55);
  font-size: 12.5px;
  color: #fff;
}

.teacher-label {
  background: rgba(139, 92, 246, 0.75);
}

.reconnect-mask {
  position: absolute;
  inset: 0;
  background: rgba(10, 16, 32, 0.78);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 5;
}

.big-spin {
  font-size: 52px;
  color: #f4b768;
  animation: rotate 1s linear infinite;
}

.reconnect-mask p {
  font-size: 17px;
  font-weight: 700;
}

.reconnect-mask span {
  font-size: 13px;
  color: #8b97b4;
}

.member-tiles {
  display: flex;
  gap: 10px;
  height: 96px;
  flex-shrink: 0;
}

.mini-tile {
  position: relative;
  width: 150px;
  background: linear-gradient(145deg, #1d2a4d, #16203a);
  border-radius: 10px;
  border: 2px solid transparent;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.mini-tile.speaking {
  border-color: #58d39a;
  box-shadow: 0 0 0 2px rgba(88, 211, 154, 0.25);
}

.mini-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  font-size: 18px;
}

.mini-name {
  position: absolute;
  left: 8px;
  bottom: 6px;
  font-size: 12px;
}

.mini-status {
  position: absolute;
  right: 8px;
  bottom: 6px;
  display: flex;
  gap: 4px;
  font-size: 13px;
}

.ic-on { color: #58d39a; }
.ic-off { color: #f4837c; }

.self-tile {
  position: absolute;
  right: 14px;
  top: 14px;
  width: 200px;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  z-index: 4;
}

.self-tile.speaking {
  border-color: #58d39a;
}

.self-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.self-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 38px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
}

.self-tile .tile-label {
  left: 8px;
  bottom: 8px;
  font-size: 11px;
  padding: 2px 9px;
}

/* 右侧面板 */
.side-panel {
  width: 320px;
  flex-shrink: 0;
  background: #16203a;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-tabs button {
  flex: 1;
  padding: 13px 0;
  background: none;
  border: none;
  color: #8b97b4;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}

.panel-tabs button.active {
  color: #fff;
  font-weight: 700;
}

.panel-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 25%;
  right: 25%;
  height: 3px;
  border-radius: 2px;
  background: #5b86ee;
}

.dot-badge,
.count {
  display: inline-block;
  min-width: 18px;
  padding: 0 5px;
  margin-left: 4px;
  border-radius: 9px;
  background: rgba(91, 134, 238, 0.3);
  color: #9db8f4;
  font-size: 11px;
}

.chat-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.chat-msg {
  margin-bottom: 14px;
}

.sys-line {
  text-align: center;
  font-size: 12px;
  color: #8b97b4;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 5px 10px;
  margin: 10px 0;
}

.msg-name {
  font-size: 12px;
  color: #8b97b4;
}

.msg-name.teacher {
  color: #f4b768;
  font-weight: 700;
}

.msg-bubble {
  display: inline-block;
  margin-top: 4px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px 12px 12px 12px;
  font-size: 13.5px;
  line-height: 1.6;
  max-width: 92%;
  word-break: break-word;
}

.chat-msg.self {
  text-align: right;
}

.chat-msg.self .msg-bubble {
  background: rgba(43, 86, 182, 0.55);
  border-radius: 12px 4px 12px 12px;
  text-align: left;
}

.msg-time {
  display: block;
  font-size: 11px;
  color: #5f6c8a;
  margin-top: 3px;
}

.chat-input {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-input :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e8edf7;
}

.members-pane {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
}

.member-row.speaking {
  background: rgba(88, 211, 154, 0.08);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}

.speaking-text {
  display: block;
  font-size: 12px;
  color: #8b97b4;
  margin-top: 2px;
}

.member-row.speaking .speaking-text {
  color: #58d39a;
}

.member-ctrls {
  display: flex;
  gap: 8px;
  font-size: 16px;
}

/* 底部工具栏 */
.live-toolbar {
  flex-shrink: 0;
  height: 72px;
  background: #16203a;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 76px;
  padding: 8px 14px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #e8edf7;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn .el-icon {
  font-size: 20px;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.tool-btn.danger {
  background: rgba(240, 77, 66, 0.25);
  color: #f4837c;
}

.tool-btn.leave {
  background: rgba(240, 77, 66, 0.85);
  color: #fff;
}

@media (max-width: 900px) {
  .live-body {
    flex-direction: column;
  }
  .side-panel {
    width: 100%;
    height: 240px;
  }
  .self-tile {
    width: 120px;
  }
}
</style>
