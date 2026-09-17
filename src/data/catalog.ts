import type { Course, Teacher } from '../types'
import { imgUrl } from '../utils/image'

/* 公共测试视频流（Google 官方示例视频桶，可直接用于播放器 / 直播演示） */
const V = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/'

export const CATEGORIES = [
  '前端开发',
  '后端开发',
  '人工智能',
  '设计创意',
  '考试认证',
  '职业素养'
]

/* ================= 讲师资源 ================= */
export const teachers: Teacher[] = [
  {
    id: 1,
    name: '陈昭明',
    title: '资深前端架构师',
    org: '前大厂前端技术专家',
    tags: ['Vue3', 'TypeScript', '工程化'],
    intro: '十年一线前端经验，主导过多个日活百万级产品的架构演进，擅长把复杂原理讲成“大白话”。',
    studentCount: 86400,
    courseCount: 12,
    cover: imgUrl('专业头像照片，戴眼镜的中国男性前端工程师，深色衬衫，浅灰色背景，职业形象照', 'square')
  },
  {
    id: 2,
    name: '林晚晴',
    title: '全栈开发讲师',
    org: 'Node.js 核心贡献者',
    tags: ['Node.js', '数据库', 'Serverless'],
    intro: '热爱开源，GitHub 高赞项目作者，课程以“项目驱动”著称，带学员从 0 写出可上线的后端服务。',
    studentCount: 62300,
    courseCount: 9,
    cover: imgUrl('专业头像照片，年轻中国女性程序员，衬衫，简洁蓝色背景，自信微笑，职业形象照', 'square')
  },
  {
    id: 3,
    name: '周彦舟',
    title: 'AI 算法专家',
    org: '计算机博士',
    tags: ['机器学习', 'PyTorch', '大模型'],
    intro: '研究方向为深度学习与大语言模型，发表顶会论文多篇，善于用生活化案例解释数学公式。',
    studentCount: 91200,
    courseCount: 15,
    cover: imgUrl('专业头像照片，中国男性AI科学家，深蓝色西装，科技感背景，职业形象照', 'square')
  },
  {
    id: 4,
    name: '苏亦辰',
    title: 'UI/UX 设计负责人',
    org: '知名互联网设计总监',
    tags: ['UI 设计', 'Figma', '交互设计'],
    intro: '曾主导多款亿级用户产品改版，主张“审美与逻辑并重”，学员作品屡次斩获设计大赛奖项。',
    studentCount: 45800,
    courseCount: 8,
    cover: imgUrl('专业头像照片，有设计感的中国男性设计师，米色针织衫，艺术工作室背景，职业形象照', 'square')
  },
  {
    id: 5,
    name: '何立轩',
    title: 'Java 后端高级讲师',
    org: '前金融科技技术经理',
    tags: ['Java', 'Spring Boot', '微服务'],
    intro: '十五年服务端研发经验，精通高并发与分布式系统，授课条理清晰，被学员称为“押题王”。',
    studentCount: 73500,
    courseCount: 11,
    cover: imgUrl('专业头像照片，稳重的中国男性Java工程师，西装马甲，书架背景，职业形象照', 'square')
  },
  {
    id: 6,
    name: '叶知秋',
    title: '职业发展导师',
    org: '全球职业规划师 GCDF',
    tags: ['简历优化', '面试辅导', '职场沟通'],
    intro: '累计辅导 3000+ 学员进入心仪企业，擅长从用人单位视角拆解简历与面试中的“潜台词”。',
    studentCount: 52900,
    courseCount: 7,
    cover: imgUrl('专业头像照片，干练的中国女性职业规划师，藏青色西装，明亮办公室背景，职业形象照', 'square')
  }
]

/* ================= 课程数据 ================= */
export const courses: Course[] = [
  {
    id: 1,
    title: 'Vue3 + TypeScript 企业级实战开发',
    category: '前端开发',
    teacherId: 1,
    price: 199,
    originalPrice: 399,
    rating: 4.9,
    students: 23800,
    level: '实战',
    duration: '36课时',
    hours: 42,
    intro:
      '从 Composition API 到 Pinia、Vue Router、Vite 工程化，完整还原企业后台项目的开发流程，学完即可独立承担中大型 Vue3 项目。',
    chapters: [
      { title: '第1章 课程导学与环境搭建', duration: '28:15', free: true },
      { title: '第2章 Composition API 核心原理', duration: '52:40', free: true },
      { title: '第3章 响应式系统源码剖析', duration: '46:10' },
      { title: '第4章 Pinia 状态管理最佳实践', duration: '39:55' },
      { title: '第5章 Vue Router 4 与权限控制', duration: '41:20' },
      { title: '第6章 Vite 构建与性能优化', duration: '48:30' },
      { title: '第7章 企业级后台综合实战', duration: '62:00' }
    ],
    videoUrl: V + 'BigBuckBunny.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['Vue3', 'TypeScript', 'Vite'],
    hot: true,
    cover: imgUrl('在线编程课程封面，Vue.js框架主题，代码屏幕与现代UI，蓝金色调，扁平插画风格'),
    updatedAt: '2026-08-28'
  },
  {
    id: 2,
    title: 'JavaScript 高级程序设计精讲',
    category: '前端开发',
    teacherId: 1,
    price: 159,
    originalPrice: 299,
    rating: 4.8,
    students: 35600,
    level: '进阶',
    duration: '42课时',
    hours: 50,
    intro:
      '作用域、闭包、原型链、异步编程、ES6+ 新特性一网打尽，配套 120 道大厂高频面试题精讲。',
    chapters: [
      { title: '第1章 执行上下文与作用域链', duration: '35:20', free: true },
      { title: '第2章 闭包的经典应用场景', duration: '42:10' },
      { title: '第3章 原型与继承完全图解', duration: '48:50' },
      { title: '第4章 事件循环与微任务宏任务', duration: '38:00' },
      { title: '第5章 Promise 与 async/await', duration: '44:30' },
      { title: '第6章 手写 Promise / 节流防抖', duration: '55:15' }
    ],
    videoUrl: V + 'ElephantsDream.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['JavaScript', '面试', '进阶'],
    hot: true,
    cover: imgUrl('JavaScript编程课程封面，黄色主题，代码编辑器特写，现代扁平科技风插画'),
    updatedAt: '2026-08-10'
  },
  {
    id: 3,
    title: 'Node.js 后端开发从入门到上线',
    category: '后端开发',
    teacherId: 2,
    price: 219,
    originalPrice: 399,
    rating: 4.8,
    students: 18900,
    level: '实战',
    duration: '38课时',
    hours: 46,
    intro:
      '基于 Node.js + Express + MongoDB 打造博客 API 与实时聊天服务，含 JWT 鉴权、文件上传、服务器部署全流程。',
    chapters: [
      { title: '第1章 Node.js 运行时与模块机制', duration: '33:40', free: true },
      { title: '第2章 Express 路由与中间件', duration: '40:20' },
      { title: '第3章 MongoDB 与 Mongoose 建模', duration: '47:10' },
      { title: '第4章 JWT 登录鉴权实战', duration: '36:55' },
      { title: '第5章 WebSocket 实时聊天室', duration: '52:30' },
      { title: '第6章 云服务器部署与运维', duration: '43:00' }
    ],
    videoUrl: V + 'ForBiggerBlazes.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['Node.js', 'MongoDB', '部署'],
    cover: imgUrl('Node.js后端开发课程封面，服务器机房与绿色Node标志元素，科技感插画'),
    updatedAt: '2026-07-30'
  },
  {
    id: 4,
    title: 'MySQL 数据库设计与优化实战',
    category: '后端开发',
    teacherId: 2,
    price: 139,
    rating: 4.7,
    students: 12400,
    level: '进阶',
    duration: '28课时',
    hours: 32,
    intro:
      'ER 建模、索引原理、SQL 调优、事务隔离级别、分库分表思路，结合真实慢查询案例手把手优化。',
    chapters: [
      { title: '第1章 关系模型与 ER 图设计', duration: '30:00', free: true },
      { title: '第2章 索引底层 B+ 树详解', duration: '42:30' },
      { title: '第3章 Explain 执行计划分析', duration: '39:10' },
      { title: '第4章 事务与锁机制', duration: '45:20' },
      { title: '第5章 慢查询优化实战', duration: '50:40' }
    ],
    videoUrl: V + 'ForBiggerEscapes.mp4',
    tags: ['MySQL', '索引', 'SQL优化'],
    cover: imgUrl('MySQL数据库课程封面，数据表结构与海豚元素，蓝色数据科技风插画'),
    updatedAt: '2026-06-18'
  },
  {
    id: 5,
    title: 'Python 机器学习入门到实战',
    category: '人工智能',
    teacherId: 3,
    price: 259,
    originalPrice: 459,
    rating: 4.9,
    students: 41200,
    level: '进阶',
    duration: '48课时',
    hours: 58,
    intro:
      '线性回归、决策树、SVM、聚类、神经网络循序渐进，使用 scikit-learn 完成房价预测、客户分群等真实项目。',
    chapters: [
      { title: '第1章 人工智能全景与环境准备', duration: '26:30', free: true },
      { title: '第2章 NumPy / Pandas 数据处理', duration: '44:00' },
      { title: '第3章 线性回归与梯度下降', duration: '49:20' },
      { title: '第4章 分类算法与模型评估', duration: '52:10' },
      { title: '第5章 决策树与随机森林', duration: '41:40' },
      { title: '第6章 神经网络初探', duration: '47:50' },
      { title: '第7章 综合项目：客户流失预测', duration: '58:30' }
    ],
    videoUrl: V + 'ForBiggerFun.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['Python', '机器学习', 'scikit-learn'],
    hot: true,
    cover: imgUrl('机器学习课程封面，神经网络节点可视化与Python标志，紫色科技感插画'),
    updatedAt: '2026-09-01'
  },
  {
    id: 6,
    title: '大模型应用开发：Prompt 到 RAG',
    category: '人工智能',
    teacherId: 3,
    price: 299,
    originalPrice: 499,
    rating: 4.9,
    students: 15700,
    level: '实战',
    duration: '32课时',
    hours: 38,
    intro:
      '系统掌握 Prompt Engineering、Function Calling、Embedding 与 RAG 知识库搭建，打造专属企业问答机器人。',
    chapters: [
      { title: '第1章 大模型能力边界认知', duration: '31:20', free: true },
      { title: '第2章 Prompt 工程方法论', duration: '43:50' },
      { title: '第3章 Function Calling 实战', duration: '38:30' },
      { title: '第4章 Embedding 与向量数据库', duration: '46:10' },
      { title: '第5章 RAG 知识库完整实现', duration: '60:00' }
    ],
    videoUrl: V + 'ForBiggerJoyrides.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['大模型', 'RAG', 'LLM'],
    isNew: true,
    cover: imgUrl('AI大模型应用开发课程封面，聊天机器人与知识图谱，未来科技蓝紫渐变插画'),
    updatedAt: '2026-09-05'
  },
  {
    id: 7,
    title: 'UI 设计零基础到作品集',
    category: '设计创意',
    teacherId: 4,
    price: 179,
    originalPrice: 329,
    rating: 4.8,
    students: 20600,
    level: '入门',
    duration: '40课时',
    hours: 44,
    intro:
      '版式、色彩、字体、图标四大基础 + Figma 实操，最终完成一套可用于求职的 App 设计作品集。',
    chapters: [
      { title: '第1章 设计师的工作流', duration: '22:40', free: true },
      { title: '第2章 版式设计四大原则', duration: '38:10' },
      { title: '第3章 色彩搭配与情绪板', duration: '35:50' },
      { title: '第4章 Figma 核心操作全解', duration: '52:20' },
      { title: '第5章 App 界面项目实战', duration: '56:30' },
      { title: '第6章 作品集包装与投递', duration: '30:00' }
    ],
    videoUrl: V + 'ForBiggerMeltdowns.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['Figma', '作品集', '零基础'],
    cover: imgUrl('UI设计课程封面，手机界面设计稿与色板工具，温暖橙粉配色，现代设计风插画'),
    updatedAt: '2026-07-12'
  },
  {
    id: 8,
    title: 'Figma 交互原型与组件库搭建',
    category: '设计创意',
    teacherId: 4,
    price: 149,
    rating: 4.7,
    students: 9800,
    level: '进阶',
    duration: '24课时',
    hours: 28,
    intro:
      'Auto Layout、Variables、组件变体、智能动画与可交互原型交付，让设计稿“活”起来。',
    chapters: [
      { title: '第1章 Auto Layout 深入理解', duration: '34:00', free: true },
      { title: '第2章 组件与变体系统', duration: '40:30' },
      { title: '第3章 Variables 设计变量', duration: '28:40' },
      { title: '第4章 智能动画与原型', duration: '42:10' }
    ],
    videoUrl: V + 'Sintel.mp4',
    tags: ['Figma', '组件库', '交互'],
    isNew: true,
    cover: imgUrl('Figma交互原型课程封面，设计组件库与连线原型图，清新蓝绿色调插画'),
    updatedAt: '2026-08-22'
  },
  {
    id: 9,
    title: 'Java Spring Boot 微服务实战',
    category: '后端开发',
    teacherId: 5,
    price: 239,
    originalPrice: 429,
    rating: 4.8,
    students: 27400,
    level: '实战',
    duration: '44课时',
    hours: 52,
    intro:
      'Spring Boot + Spring Cloud Alibaba 全家桶，覆盖注册中心、网关、熔断限流、分布式事务，电商项目微服务化落地。',
    chapters: [
      { title: '第1章 Spring Boot 自动装配原理', duration: '36:20', free: true },
      { title: '第2章 Nacos 注册与配置中心', duration: '41:00' },
      { title: '第3章 Gateway 网关与鉴权', duration: '39:40' },
      { title: '第4章 Sentinel 熔断限流', duration: '44:20' },
      { title: '第5章 分布式事务 Seata', duration: '48:50' },
      { title: '第6章 电商微服务综合项目', duration: '65:10' }
    ],
    videoUrl: V + 'TearsOfSteel.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['Java', 'Spring Boot', '微服务'],
    hot: true,
    cover: imgUrl('Java Spring Boot微服务课程封面，微服务架构图与咖啡元素，橙红色科技风插画'),
    updatedAt: '2026-08-02'
  },
  {
    id: 10,
    title: '软考中级 · 软件设计师冲刺班',
    category: '考试认证',
    teacherId: 5,
    price: 329,
    originalPrice: 599,
    rating: 4.9,
    students: 16800,
    level: '进阶',
    duration: '56课时',
    hours: 64,
    intro:
      '上午题 + 下午题双线突破，数据结构、UML、设计模式、软件工程考点全覆盖，历年真题逐题精析。',
    chapters: [
      { title: '第1章 考情分析与备考规划', duration: '25:00', free: true },
      { title: '第2章 数据结构与算法', duration: '58:30' },
      { title: '第3章 操作系统与计算机网络', duration: '49:10' },
      { title: '第4章 UML 与设计模式', duration: '52:40' },
      { title: '第5章 软件工程与项目管理', duration: '45:20' },
      { title: '第6章 历年真题精讲（一）', duration: '60:00' },
      { title: '第7章 历年真题精讲（二）', duration: '60:00' }
    ],
    videoUrl: V + 'SubaruOutbackOnStreetAndDirt.mp4',
    tags: ['软考', '真题', '证书'],
    cover: imgUrl('软件设计师考试课程封面，证书奖杯与书本知识元素，学院蓝与金色配色插画'),
    updatedAt: '2026-06-30'
  },
  {
    id: 11,
    title: '应届生简历优化与面试通关',
    category: '职业素养',
    teacherId: 6,
    price: 99,
    originalPrice: 199,
    rating: 4.9,
    students: 33200,
    level: '入门',
    duration: '18课时',
    hours: 20,
    intro:
      'HR 视角拆解简历筛选逻辑，STAR 法则包装项目经历，技术面 / HR 面 / 谈薪全流程模拟演练。',
    chapters: [
      { title: '第1章 简历的 7 秒筛选法则', duration: '24:10', free: true },
      { title: '第2章 项目经历 STAR 包装术', duration: '33:40' },
      { title: '第3章 技术面自我介绍与问答', duration: '36:20' },
      { title: '第4章 HR 面高频问题拆解', duration: '29:50' },
      { title: '第5章 Offer 对比与谈薪技巧', duration: '26:30' }
    ],
    videoUrl: V + 'VolkswagenGTIReview.mp4',
    subtitleUrl: '/subtitles/zh-demo.vtt',
    tags: ['简历', '面试', '求职'],
    hot: true,
    cover: imgUrl('求职面试指导课程封面，简历与握手录用通知元素，明亮自信的蓝金配色插画'),
    updatedAt: '2026-09-06'
  },
  {
    id: 12,
    title: '职场高效沟通与汇报技巧',
    category: '职业素养',
    teacherId: 6,
    price: 79,
    rating: 4.6,
    students: 8700,
    level: '入门',
    duration: '16课时',
    hours: 18,
    intro:
      '向上汇报、跨部门协作、会议表达、文档写作四大场景，用结构化思维让你的表达清晰有力。',
    chapters: [
      { title: '第1章 结构化思维金字塔原理', duration: '28:00', free: true },
      { title: '第2章 向上汇报的三段式', duration: '30:20' },
      { title: '第3章 跨部门沟通策略', duration: '32:10' },
      { title: '第4章 会议与文档表达', duration: '27:40' }
    ],
    videoUrl: V + 'WeAreGoingOnBullrun.mp4',
    tags: ['沟通', '汇报', '职场'],
    isNew: true,
    cover: imgUrl('职场沟通课程封面，现代办公室会议讨论场景，扁平化人物插画，蓝白配色'),
    updatedAt: '2026-08-15'
  }
]

/* ================= 首页活动 ================= */
export const promos = [
  {
    id: 1,
    kicker: '开学季 · 限时活动',
    title: '新生礼包 全场课程立减 100',
    desc: '9 月 1 日 - 9 月 20 日，注册即领 200 元学习礼包，热门好课低至 5 折',
    color: 'linear-gradient(120deg, #1d3f8f 0%, #2b56b6 55%, #3a6fd8 100%)',
    image: imgUrl('教育平台开学季促销横幅，学士帽书本与金色桂花装饰，深蓝背景，现代扁平插画，宽幅构图', 'landscape_16_9')
  },
  {
    id: 2,
    kicker: '直播预告',
    title: '名师直播夜 · 大模型公开课',
    desc: '周彦舟博士亲授：零基础 60 分钟跑通第一个 RAG 应用，直播间抽送 10 张学习券',
    color: 'linear-gradient(120deg, #4b2d8f 0%, #6d4bc4 55%, #8d6be0 100%)',
    image: imgUrl('在线直播课堂横幅，老师在屏幕中讲课，弹幕互动与科技光线，紫色调现代扁平插画，宽幅构图', 'landscape_16_9')
  },
  {
    id: 3,
    kicker: '会员专享',
    title: '桂冠年卡 · 千门好课免费学',
    desc: '单次开通畅学 365 天，新增 AI 与软考系列专栏，支持学习进度多端同步',
    color: 'linear-gradient(120deg, #8a5a17 0%, #c99b3c 60%, #e2bb63 100%)',
    image: imgUrl('在线教育会员年卡促销横幅，金色月桂叶奖杯与卡片，高级金棕色调，精致扁平插画，宽幅构图', 'landscape_16_9')
  }
]
