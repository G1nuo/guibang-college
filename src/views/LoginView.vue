<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const loginFormRef = ref<FormInstance>()
const regFormRef = ref<FormInstance>()

const loginForm = reactive({ username: '', password: '' })
const regForm = reactive({
  username: '',
  password: '',
  confirm: '',
  nickname: '',
  phone: ''
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ]
}

const regRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{3,16}$/,
      message: '用户名为 3-16 位字母、数字或下划线',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
  ],
  confirm: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_r, v, cb) => {
        if (v !== regForm.password) cb(new Error('两次输入的密码不一致'))
        else cb()
      },
      trigger: 'blur'
    }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '昵称长度为 2-10 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的 11 位手机号',
      trigger: 'blur'
    }
  ]
}

/** 登录成功后回跳 */
function redirectAfterAuth() {
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}

async function onLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const u = await userStore.login(loginForm.username.trim(), loginForm.password)
      ElMessage.success(`欢迎回来，${u.nickname}！`)
      redirectAfterAuth()
    } catch (e) {
      ElMessage.error((e as Error).message)
    } finally {
      loading.value = false
    }
  })
}

async function onRegister() {
  if (!regFormRef.value) return
  await regFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const u = await userStore.register({
        username: regForm.username.trim(),
        password: regForm.password,
        nickname: regForm.nickname.trim(),
        phone: regForm.phone.trim()
      })
      ElMessage.success(`注册成功，欢迎加入桂冠学堂，${u.nickname}！`)
      redirectAfterAuth()
    } catch (e) {
      ElMessage.error((e as Error).message)
    } finally {
      loading.value = false
    }
  })
}

/** 一键填充演示账号 */
function fillDemo() {
  loginForm.username = 'student'
  loginForm.password = '123456'
  ElMessage.info('已填充演示账号，点击登录即可体验')
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 左侧品牌区 -->
      <div class="brand-side">
        <div class="brand-logo-lg">
          <svg viewBox="0 0 1024 1024" width="40" height="40" fill="currentColor">
            <path
              d="M512 128L64 341.3l448 213.3 384-183v300.4h85.3V341.3L512 128zM234.7 486.4v192c0 71.4 124.2 128 277.3 128s277.3-56.6 277.3-128v-192L512 622.9 234.7 486.4z"
            />
          </svg>
        </div>
        <h1>桂冠学堂</h1>
        <p>让每一份努力都戴上桂冠</p>
        <ul class="brand-points">
          <li>🎓 100+ 门体系化精品课程</li>
          <li>📹 视频进度记忆，断点续播</li>
          <li>🎥 名师直播课堂，实时互动答疑</li>
          <li>📊 学习数据追踪，成长看得见</li>
        </ul>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-side">
        <el-tabs v-model="mode" class="mode-tabs" stretch>
          <el-tab-pane label="账号登录" name="login" />
          <el-tab-pane label="注册新账号" name="register" />
        </el-tabs>

        <!-- 登录表单 -->
        <el-form
          v-if="mode === 'login'"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          size="large"
          @keyup.enter="onLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" clearable>
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            >
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="onLogin"
          >
            登 录
          </el-button>
          <div class="demo-tip" @click="fillDemo">
            <el-icon><InfoFilled /></el-icon>
            演示账号：student / 123456（点击自动填充）
          </div>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-else
          ref="regFormRef"
          :model="regForm"
          :rules="regRules"
          label-position="top"
          size="large"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="regForm.username" placeholder="3-16 位字母 / 数字 / 下划线" clearable />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="regForm.nickname" placeholder="请输入昵称，如：李同学" clearable />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="regForm.phone" placeholder="用于找回密码" maxlength="11" clearable />
          </el-form-item>
          <el-form-item label="设置密码" prop="password">
            <el-input v-model="regForm.password" type="password" placeholder="6-20 位密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input v-model="regForm.confirm" type="password" placeholder="请再次输入密码" show-password />
          </el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="onRegister"
          >
            注 册
          </el-button>
          <p class="agreement">注册即表示同意《桂冠学堂用户协议》与《隐私政策》</p>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - var(--gg-header-h));
  display: grid;
  place-items: center;
  padding: 40px 20px;
  background:
    radial-gradient(circle at 12% 20%, rgba(43, 86, 182, 0.12), transparent 40%),
    radial-gradient(circle at 88% 80%, rgba(201, 155, 60, 0.12), transparent 40%),
    var(--gg-bg);
}

.login-card {
  width: 860px;
  max-width: 100%;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  background: #fff;
  border-radius: var(--gg-radius-lg);
  overflow: hidden;
  box-shadow: var(--gg-shadow-hover);
}

.brand-side {
  background: linear-gradient(155deg, var(--gg-primary-deep), var(--gg-primary) 70%, #4f7de0);
  color: #fff;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
}

.brand-logo-lg {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 22px;
}

.brand-side h1 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 2px;
}

.brand-side > p {
  margin: 10px 0 34px;
  opacity: 0.85;
}

.brand-points li {
  line-height: 2.6;
  font-size: 14.5px;
  opacity: 0.95;
}

.form-side {
  padding: 36px 44px 40px;
}

:deep(.mode-tabs .el-tabs__item) {
  font-size: 17px;
  font-weight: 700;
}

.submit-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 6px;
  margin-top: 4px;
}

.demo-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--gg-gold-light);
  color: var(--gg-gold);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-tip:hover {
  background: #f6e8cc;
}

.agreement {
  margin-top: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--gg-ink-3);
}

@media (max-width: 760px) {
  .login-card {
    grid-template-columns: 1fr;
  }
  .brand-side {
    display: none;
  }
}
</style>
