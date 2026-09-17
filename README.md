# 桂冠学堂 · GuiGuan Academy

> 基于 Vue 3 + TypeScript 的在线教育平台（前端全栈 Mock 版），涵盖课程商城、视频学习、直播课堂与个人中心完整学习闭环。

![Vue](https://img.shields.io/badge/Vue-3.4-42b883) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6) ![Vite](https://img.shields.io/badge/Vite-5.4-646cff) ![Element Plus](https://img.shields.io/badge/Element%20Plus-2.8-409eff) ![Pinia](https://img.shields.io/badge/Pinia-2.2-ffd859) ![ECharts](https://img.shields.io/badge/ECharts-5.5-c23531)

## 在线演示

推送至 GitHub 后，由 GitHub Actions 自动构建部署：

- 演示地址：`https://<你的用户名>.github.io/<仓库名>/`
- 首次使用需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**

## 功能特性

- 🏠 **首页**：优惠活动轮播、名师天团、精选课程、平台数据可视化（注册趋势折线图 + 分类占比环形图）
- 📚 **课程中心**：分类筛选、关键词搜索、多维排序、分页、骨架屏加载、空结果提示，查询条件与 URL 同步
- 🎬 **课程详情**：章节列表、讲师介绍、收藏、学习进度条、60 秒试看拦截与模拟支付
- 📺 **视频播放器**：自研封装，支持倍速播放、音量调节、全屏、字幕开关、进度记忆与断点续播
- 🔐 **登录注册**：表单校验、模拟 JWT、Token 持久化、全局路由守卫、未登录拦截与登录后回跳
- 🎥 **直播课堂**：WebRTC 音视频推流、成员列表、静音 / 关摄像头、文字聊天、断线重连遮罩与自动恢复
- 👤 **个人中心**：我的课程（学习进度）、我的收藏、订单记录、学习数据图表（柱状图 + 雷达图）
- 🛡️ **健壮性**：外部视频源不可达时自动降级 Canvas 演示流，图片加载失败降级学院色渐变占位封面

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Vue 3（`<script setup>` 组合式 API） |
| 语言 | TypeScript 5 |
| 构建 | Vite 5 |
| UI 组件库 | Element Plus 2 + @element-plus/icons-vue |
| 状态管理 | Pinia |
| 路由 | Vue Router 4（hash 模式 + 全局前置守卫） |
| 图表 | ECharts 5 |
| 音视频 | WebRTC（RTCPeerConnection）、canvas.captureStream |
| 数据层 | localStorage 模拟后端 REST API + 模拟 JWT 鉴权 |

## 快速开始

### 环境要求

- Node.js ≥ 18（推荐 20 LTS）
- npm ≥ 9

### 安装与运行

```bash
# 安装依赖（如遇 peer 依赖警告请加 --legacy-peer-deps）
npm install --legacy-peer-deps

# 启动开发服务器 http://localhost:5173
npm run dev

# 生产构建（输出至 dist/）
npm run build

# 本地预览生产构建
npm run preview
```

## 演示账号

| 角色 | 账号 | 密码 | 说明 |
| --- | --- | --- | --- |
| 学生 | `student` | `123456` | 含已购课程、收藏与学习进度 |
| 教师 | `teacher` | `123456` | 讲师演示账号 |
| 管理员 | `admin` | `123456` | 管理员演示账号 |

> 也可在登录页使用"演示账号一键填充"，或自行注册新账号（真实写入本地数据库，刷新保留）。

## 目录结构

```
桂冠学堂/
├── .github/workflows/deploy.yml   # GitHub Pages 自动部署
├── public/
│   └── subtitles/zh-demo.vtt      # 视频字幕
├── src/
│   ├── api/index.ts               # 模拟 REST API（鉴权/课程/订单/收藏/进度/统计）
│   ├── components/                # 通用组件（播放器、图表、卡片、骨架屏等）
│   ├── data/catalog.ts            # 课程 / 教师 / 活动 / 分类种子数据
│   ├── mock/db.ts                 # localStorage 数据库与种子用户
│   ├── router/index.ts            # 路由表与全局鉴权守卫
│   ├── sections/                  # 首页板块（轮播/师资/课程/统计）
│   ├── stores/user.ts             # Pinia 用户状态
│   ├── styles/                    # 主题变量（学院蓝 × 桂冠金）与全局样式
│   ├── types/                     # TypeScript 类型定义
│   ├── utils/                     # 格式化、存储、配图、Canvas 演示流
│   ├── views/                     # 页面视图
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## 数据说明

本项目为纯前端项目，无真实后端：

- 所有数据存储于浏览器 `localStorage`（数据库键 `ggxueyuan_db_v1`，Token 键 `gg_token`）
- 注册、下单、收藏、学习进度等操作均真实持久化，清除浏览器数据即可重置
- 课程视频使用公共示例视频源；网络受限时播放器与直播间会自动切换内置 Canvas 演示流

## 部署

### GitHub Pages（推荐，已内置工作流）

1. 在 GitHub 新建仓库并推送本项目（默认分支使用 `main`）
2. 进入仓库 **Settings → Pages**，将 **Source** 设为 **GitHub Actions**
3. 推送后 Actions 自动执行构建部署，进度见 **Actions** 标签页
4. 部署成功后访问 `https://<你的用户名>.github.io/<仓库名>/`

工作流文件：[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)。
`vite.config.ts` 已配置 `base: './'`，配合 hash 路由可直接部署到任意子路径，无需按仓库名修改。

### 静态服务器 / Nginx

```bash
npm run build
# 将 dist/ 目录交由任意静态服务器托管即可
```

## 浏览器兼容

Chrome / Edge / Firefox / Safari 最新两个版本（直播功能依赖 WebRTC，建议使用桌面端 Chrome 或 Edge）。

## 免责声明

本项目仅用于学习与毕业设计交流，课程数据与视频素材均来自公开演示资源，不用于任何商业用途。
