/* 统一的配图生成地址（平台所有课程 / 讲师 / 活动图片均走该服务） */
export type ImgSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9'

export function imgUrl(prompt: string, size: ImgSize = 'landscape_16_9'): string {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`
}

/** 学院色渐变 SVG 占位封面（图片服务不可达时兜底） */
export function svgPlaceholder(label: string): string {
  const text = (label || '桂冠学堂').replace(/[<>&]/g, '').slice(0, 12)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2b56b6"/><stop offset="1" stop-color="#c99b3c"/>
  </linearGradient></defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <circle cx="280" cy="20" r="70" fill="rgba(255,255,255,0.10)"/>
  <circle cx="20" cy="170" r="50" fill="rgba(255,255,255,0.08)"/>
  <text x="160" y="86" fill="#ffffff" font-size="15" font-family="sans-serif" text-anchor="middle" letter-spacing="3" opacity="0.85">桂冠学堂</text>
  <text x="160" y="116" fill="#ffffff" font-size="19" font-weight="bold" font-family="sans-serif" text-anchor="middle">${text}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 绑定到 <img @error>：加载失败时替换为渐变占位封面 */
export function onImgError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (!img || img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = svgPlaceholder(img.alt)
}
