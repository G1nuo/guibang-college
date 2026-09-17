<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="gg-footer">
    <div class="gg-container footer-grid">
      <div class="footer-brand">
        <div class="brand-line">
          <span class="brand-logo">
            <svg viewBox="0 0 1024 1024" width="22" height="22" fill="currentColor">
              <path
                d="M512 128L64 341.3l448 213.3 384-183v300.4h85.3V341.3L512 128zM234.7 486.4v192c0 71.4 124.2 128 277.3 128s277.3-56.6 277.3-128v-192L512 622.9 234.7 486.4z"
              />
            </svg>
          </span>
          <strong>桂冠学堂</strong>
        </div>
        <p>让每一份努力都戴上桂冠。</p>
        <p>专业 · 实战 · 陪伴成长的在线教育平台</p>
      </div>
      <div class="footer-col">
        <h4>学习中心</h4>
        <router-link to="/courses">课程中心</router-link>
        <router-link to="/live/1">直播课堂</router-link>
        <router-link to="/profile">个人中心</router-link>
      </div>
      <div class="footer-col">
        <h4>热门方向</h4>
        <router-link to="/courses?category=前端开发">前端开发</router-link>
        <router-link to="/courses?category=人工智能">人工智能</router-link>
        <router-link to="/courses?category=考试认证">考试认证</router-link>
      </div>
      <div class="footer-col">
        <h4>帮助与支持</h4>
        <a href="javascript:void(0)">帮助中心</a>
        <a href="javascript:void(0)">意见反馈</a>
        <a href="javascript:void(0)">联系客服</a>
      </div>
    </div>
    <div class="copyright">
      © {{ year }} 桂冠学堂 GuiGuan Academy · 毕业设计演示项目 · 数据由本地浏览器存储模拟
    </div>
  </footer>
</template>

<style scoped>
.gg-footer {
  margin-top: 40px;
  background: #15233f;
  color: #b8c2d6;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 48px 20px 36px;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--gg-primary), #4f7de0);
}

.brand-line strong {
  font-size: 18px;
  color: #fff;
}

.footer-brand p {
  font-size: 13px;
  line-height: 2;
}

.footer-col h4 {
  color: #fff;
  font-size: 15px;
  margin-bottom: 14px;
}

.footer-col a {
  display: block;
  font-size: 13px;
  line-height: 2.1;
  color: #b8c2d6;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: var(--gg-gold);
}

.copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: #7e8aa3;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
}
</style>
