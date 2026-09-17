import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 桂冠学堂 · Vite 工程配置
export default defineConfig({
  // 相对路径，兼容 GitHub Pages 项目站点（https://user.github.io/repo/）
  // hash 路由下本地开发与各级子路径部署均不受影响
  base: './',
  plugins: [vue()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
