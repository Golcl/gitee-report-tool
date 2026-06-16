<template>
  <div class="callback-page">
    <div class="callback-card">
      <el-icon class="loading-icon" :size="48">
        <Loading />
      </el-icon>
      <h2>正在完成授权...</h2>
      <p class="hint">请稍候，正在处理 Gitee 授权回调</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { setStoredToken, getCurrentUser, setStoredUser } from '@/api/gitee'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const code = route.query.code as string

  if (!code) {
    ElMessage.error('授权失败：未收到授权码')
    router.replace('/')
    return
  }

  try {
    // 通过 Gitee OAuth 代理接口换取 token
    // 此处使用 code 直接作为 token 的简化方案
    // 生产环境应通过后端服务用 client_secret 换取 token
    const tokenRes = await exchangeCodeForToken(code)
    if (!tokenRes) {
      ElMessage.error('Token 换取失败，请使用个人访问令牌登录')
      router.replace('/')
      return
    }

    setStoredToken(tokenRes)
    const user = await getCurrentUser()
    setStoredUser(user)

    ElMessage.success(`欢迎回来，${user.name || user.login}！`)
    router.replace('/')
  } catch (e: any) {
    ElMessage.error(`授权失败：${e.message}`)
    router.replace('/')
  }
})

async function exchangeCodeForToken(code: string): Promise<string | null> {
  // Gitee OAuth token 换取接口（需要 client_secret，建议通过后端代理）
  // 这里作为前端 demo，如果用户配置了环境变量则尝试直接换取
  const clientId = import.meta.env.VITE_GITEE_CLIENT_ID
  const clientSecret = import.meta.env.VITE_GITEE_CLIENT_SECRET
  const redirectUri = import.meta.env.VITE_GITEE_REDIRECT_URI || window.location.origin + window.location.pathname + '#/callback'

  if (!clientId || !clientSecret || clientId === 'YOUR_CLIENT_ID') {
    return null
  }

  try {
    const res = await fetch('https://gitee.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })

    const data = await res.json()
    return data.access_token || null
  } catch {
    return null
  }
}
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.callback-card {
  background: #fff;
  border-radius: 20px;
  padding: 60px 80px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.loading-icon {
  color: var(--primary);
  animation: spin 1s linear infinite;
}

h2 {
  margin-top: 24px;
  font-size: 22px;
  color: var(--text);
}

.hint {
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
