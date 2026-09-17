/**
 * 演示媒体流兜底方案：
 * 当外部视频 CDN 不可达（如受限网络环境）时，使用
 * canvas.captureStream() 生成真实的 MediaStream，
 * 让 WebRTC 推流 / 视频播放器管线在任何网络下都可演示。
 */

export interface DemoStreamHandle {
  stream: MediaStream
  stop: () => void
}

/** 向流中添加一条静音音轨（保证音视频双轨结构） */
function attachSilentAudio(stream: MediaStream): void {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0 // 静音
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    const dest = ctx.createMediaStreamDestination()
    gain.connect(dest)
    stream.addTrack(dest.stream.getAudioTracks()[0])
  } catch {
    /* 无音频环境时忽略，视频轨仍可用 */
  }
}

/** 讲师“共享屏幕”风格的演示流（课件翻页 + 时钟） */
export function createTeacherCanvasStream(title: string): DemoStreamHandle {
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext('2d')!

  const bullets = [
    '一、RAG 知识库整体架构回顾',
    '二、文档切分策略与 Embedding 向量化',
    '三、向量数据库索引与相似度检索',
    '四、Prompt 拼装与效果评估',
    '五、实战答疑与课后作业'
  ]

  let raf = 0
  const t0 = Date.now()

  function draw() {
    const t = (Date.now() - t0) / 1000
    // 背景
    const bg = ctx.createLinearGradient(0, 0, 1280, 720)
    bg.addColorStop(0, '#101c3d')
    bg.addColorStop(1, '#1d3f8f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1280, 720)

    // 顶部条
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(0, 0, 1280, 86)
    ctx.fillStyle = '#c99b3c'
    ctx.font = 'bold 30px sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎓 桂冠学堂 · 讲师共享屏幕', 48, 44)
    ctx.fillStyle = '#9db8f4'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(
      new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      1232,
      44
    )

    // 课件标题
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText(title, 64, 170)

    // 知识点条目（逐条高亮）
    bullets.forEach((b, i) => {
      const active = Math.floor(t / 4) % bullets.length === i
      ctx.fillStyle = active ? '#c99b3c' : 'rgba(255,255,255,0.72)'
      ctx.font = active ? 'bold 30px sans-serif' : '28px sans-serif'
      const y = 270 + i * 72
      ctx.fillText((active ? '▶ ' : '  ') + b, 90, y)
    })

    // 底部声波动画（表示正在讲授）
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(0, 688, 1280, 4)
    for (let i = 0; i < 64; i++) {
      const h = 8 + Math.abs(Math.sin(t * 3 + i * 0.6)) * 22
      ctx.fillStyle = '#58d39a'
      ctx.fillRect(48 + i * 19, 680 - h, 10, h)
    }

    raf = requestAnimationFrame(draw)
  }
  draw()

  const stream = canvas.captureStream(30)
  attachSilentAudio(stream)
  return {
    stream,
    stop() {
      cancelAnimationFrame(raf)
      stream.getTracks().forEach((tr) => tr.stop())
    }
  }
}

/** 播放器兜底演示流：绘制封面图 + 滚动字幕条 + 进度感动画 */
export function createPlayerCanvasStream(
  poster?: string,
  caption = '演示模式：外部视频源暂不可达，播放器功能可正常操作'
): DemoStreamHandle {
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext('2d')!
  const img = new Image()
  img.crossOrigin = 'anonymous'
  let imgReady = false
  if (poster) {
    img.onload = () => (imgReady = true)
    img.src = poster
  }

  let raf = 0
  const t0 = Date.now()

  function draw() {
    const t = (Date.now() - t0) / 1000

    // 封面图铺满
    if (imgReady && img.width > 0) {
      const ratio = Math.max(1280 / img.width, 720 / img.height)
      const w = img.width * ratio
      const h = img.height * ratio
      ctx.globalAlpha = 0.55
      ctx.drawImage(img, (1280 - w) / 2, (720 - h) / 2, w, h)
      ctx.globalAlpha = 1
    } else {
      const bg = ctx.createLinearGradient(0, 0, 1280, 720)
      bg.addColorStop(0, '#16203a')
      bg.addColorStop(1, '#2b56b6')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, 1280, 720)
    }

    // 中央播放图标
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.beginPath()
    ctx.arc(640, 340, 64, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1d3f8f'
    ctx.beginPath()
    ctx.moveTo(624, 306)
    ctx.lineTo(624, 374)
    ctx.lineTo(680, 340)
    ctx.closePath()
    ctx.fill()

    // 标题
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 34px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('桂冠学堂 · 课程播放中', 640, 470)

    // 底部滚动字幕条
    const w = ctx.measureText(caption).width
    const x = 1280 - ((t * 120) % (1280 + w + 80))
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 660, 1280, 48)
    ctx.fillStyle = '#fff'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(caption + '   ' + caption, x, 690)

    raf = requestAnimationFrame(draw)
  }
  draw()

  const stream = canvas.captureStream(30)
  attachSilentAudio(stream)
  return {
    stream,
    stop() {
      cancelAnimationFrame(raf)
      stream.getTracks().forEach((tr) => tr.stop())
    }
  }
}
