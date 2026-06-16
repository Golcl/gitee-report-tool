<template>
  <div class="home-page">
    <!-- 已登录状态 - 主界面 -->
    <template v-if="isLoggedIn">
      <!-- 顶部导航栏 -->
      <header class="top-bar">
        <div class="brand">
          <div class="logo-icon">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <span class="brand-text">Gitee 工作报告生成器</span>
        </div>
        <div class="user-area">
          <el-dropdown trigger="click">
            <div class="user-badge">
              <el-avatar :src="user?.avatar_url" :size="36" />
              <span class="user-name">{{ user?.name || user?.login }}</span>
              <el-icon class="arrow-down"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <span class="dropdown-label">{{ user?.login }}</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="main-content">
        <div class="content-wrapper fade-in-up">
          <!-- 步骤卡片 -->
          <el-card class="config-card">
            <div class="card-header">
              <div class="step-badge">1</div>
              <h3>选择时间范围</h3>
            </div>

            <div class="range-selector">
              <div class="quick-buttons">
                <el-button
                  v-for="opt in rangeOptions"
                  :key="opt.value"
                  :type="selectedRange === opt.value ? 'primary' : 'default'"
                  :class="['range-btn', { active: selectedRange === opt.value }]"
                  size="large"
                  round
                  @click="selectRange(opt.value)"
                >
                  <el-icon :size="18"><component :is="opt.icon" /></el-icon>
                  <span>{{ opt.label }}</span>
                </el-button>
              </div>

              <transition name="el-fade-in-linear">
                <div v-if="selectedRange === 'custom'" class="custom-range">
                  <el-date-picker
                    v-model="customDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :shortcuts="dateShortcuts"
                    size="large"
                  />
                </div>
              </transition>

              <div class="range-preview" v-if="currentRangeLabel">
                <el-icon :size="16"><Clock /></el-icon>
                <span>{{ currentRangeLabel }}</span>
              </div>
            </div>
          </el-card>

          <!-- 生成按钮 -->
          <div class="action-bar">
            <el-button
              type="primary"
              size="large"
              :loading="isGenerating"
              :disabled="!canGenerate"
              @click="handleGenerate"
              class="generate-btn"
            >
              <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
              {{ isGenerating ? '正在生成报告...' : '生成工作报告' }}
            </el-button>
          </div>

          <!-- 生成进度 -->
          <transition name="el-fade-in-linear">
            <el-card v-if="isGenerating" class="progress-card">
              <div class="progress-info">
                <el-icon class="loading-pulse" :size="20" color="var(--primary)">
                  <Loading />
                </el-icon>
                <span>{{ progressText }}</span>
              </div>
              <el-progress
                :percentage="progressPercent"
                :stroke-width="6"
                :show-text="false"
                color="var(--primary)"
              />
            </el-card>
          </transition>

          <!-- 报告面板 -->
          <transition name="el-fade-in-linear">
            <el-card v-if="showReport" class="report-card">
              <div class="card-header">
                <div class="step-badge done">✓</div>
                <h3>工作报告</h3>
                <div class="header-actions">
                  <el-tag type="info" effect="plain" round>
                    共 {{ reportStats.commits }} 次提交 · {{ reportStats.repos }} 个仓库
                  </el-tag>
                  <el-button
                    :icon="FullScreen"
                    round
                    @click="handleFullscreen"
                  >
                    放大显示
                  </el-button>
                  <el-button
                    type="primary"
                    :icon="copyIcon"
                    round
                    @click="handleCopy"
                    :loading="isCopying"
                  >
                    {{ isCopying ? '已复制' : '一键复制' }}
                  </el-button>
                </div>
              </div>

              <el-input
                v-model="reportText"
                type="textarea"
                :rows="18"
                placeholder="报告内容将显示在这里..."
                class="report-textarea"
                resize="vertical"
              />
            </el-card>
          </transition>

          <!-- 全屏展示弹窗 -->
          <el-dialog
            v-model="showFullscreen"
            title="工作报告 - 全屏预览"
            fullscreen
            :destroy-on-close="false"
            class="fullscreen-dialog"
          >
            <div class="fullscreen-toolbar">
              <el-tag type="info" effect="plain" round size="large">
                共 {{ reportStats.commits }} 次提交 · {{ reportStats.repos }} 个仓库
              </el-tag>
              <el-button
                type="primary"
                :icon="copyIcon"
                round
                @click="handleCopy"
                :loading="isCopying"
              >
                {{ isCopying ? '已复制' : '一键复制' }}
              </el-button>
            </div>
            <el-input
              v-model="reportText"
              type="textarea"
              placeholder="报告内容将显示在这里..."
              class="fullscreen-textarea"
              resize="none"
            />
          </el-dialog>
        </div>
      </main>

      <!-- 页脚 -->
      <footer class="app-footer">
        <p>Gitee 工作报告生成器 · 让汇报更轻松</p>
      </footer>
    </template>

    <!-- 未登录状态 - 登录页面 -->
    <template v-else>
      <div class="login-page">
        <!-- 装饰背景 -->
        <div class="bg-decoration">
          <div class="circle c1"></div>
          <div class="circle c2"></div>
          <div class="circle c3"></div>
        </div>

        <div class="login-container fade-in-up">
          <div class="login-header">
            <div class="hero-icon">
              <el-icon :size="56"><Document /></el-icon>
            </div>
            <h1>Gitee 工作报告生成器</h1>
            <p class="subtitle">连接你的 Gitee 账号，自动生成周报 / 月报 / 年报</p>
          </div>

          <el-card class="login-card">
            <el-tabs v-model="loginMethod" class="login-tabs">
              <!-- 个人访问令牌登录 -->
              <el-tab-pane label="🔑 访问令牌登录" name="token">
                <div class="token-login">
                  <p class="login-hint">
                    使用 Gitee 个人访问令牌登录，安全便捷。
                  </p>
                  <el-input
                    v-model="tokenInput"
                    placeholder="请输入 Gitee 个人访问令牌"
                    size="large"
                    type="password"
                    show-password
                    clearable
                    @keyup.enter="handleTokenLogin"
                  >
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                  </el-input>
                  <div class="token-help">
                    <el-link
                      type="primary"
                      underline="never"
                      @click="openTokenGuide"
                    >
                      如何获取访问令牌？
                      <el-icon><Link /></el-icon>
                    </el-link>
                  </div>
                  <el-button
                    type="primary"
                    size="large"
                    :loading="isLoggingIn"
                    :disabled="!tokenInput.trim()"
                    @click="handleTokenLogin"
                    class="login-submit-btn"
                  >
                    登录
                  </el-button>
                </div>
              </el-tab-pane>

              <!-- OAuth 授权登录 -->
              <el-tab-pane label="🔗 OAuth 授权登录" name="oauth">
                <div class="oauth-login">
                  <p class="login-hint">
                    通过 Gitee OAuth 授权登录（需先在 Gitee 注册 OAuth 应用）
                  </p>
                  <el-alert
                    type="info"
                    :closable="false"
                    show-icon
                    class="oauth-alert"
                  >
                    <template #title>
                      回调地址请设置为：<code>{{ oauthCallbackUrl }}</code>
                    </template>
                  </el-alert>
                  <el-button
                    type="primary"
                    size="large"
                    @click="handleOAuthLogin"
                    :disabled="!oauthConfigured"
                    class="login-submit-btn oauth-btn"
                  >
                    <el-icon><Connection /></el-icon>
                    通过 Gitee 授权登录
                  </el-button>
                  <p v-if="!oauthConfigured" class="oauth-warning">
                    请先配置 <code>.env</code> 文件中的 OAuth 参数
                  </p>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <div class="features-row">
            <div class="feature-item">
              <el-icon :size="24" color="var(--primary)"><Clock /></el-icon>
              <span>灵活时间范围</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="var(--accent)"><MagicStick /></el-icon>
              <span>智能整理总结</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="#fdcb6e"><CopyDocument /></el-icon>
              <span>一键复制分享</span>
            </div>
          </div>
        </div>

        <footer class="login-footer">
          <p>Gitee 工作报告生成器 · 让汇报更轻松</p>
        </footer>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import type { RangeType, GiteeUser, GiteeRepo, ReportItem } from '@/types'
import {
  getAuthUrl,
  setStoredToken,
  getStoredToken,
  getStoredUser,
  setStoredUser,
  clearAuth,
  getCurrentUser,
  getUserRepos,
  getRepoCommits,
} from '@/api/gitee'
import {
  getTimeRange,
  commitsToReportItems,
  generateReportText,
  copyToClipboard,
} from '@/utils'

// ============ 状态 ============
const token = ref<string | null>(getStoredToken())
const user = ref<GiteeUser | null>(getStoredUser())
const isLoggedIn = computed(() => !!token.value)
const loginMethod = ref('token')

// 登录相关
const tokenInput = ref('')
const isLoggingIn = ref(false)
const oauthCallbackUrl = computed(() => window.location.origin + window.location.pathname + '#/callback')
const oauthConfigured = computed(() => {
  const id = import.meta.env.VITE_GITEE_CLIENT_ID
  return id && id !== 'YOUR_CLIENT_ID'
})

// 范围选择
const selectedRange = ref<RangeType>('week')
const customDateRange = ref<[string, string] | null>(null)
const rangeOptions = [
  { value: 'week' as RangeType, label: '本周', icon: 'Sunny' },
  { value: 'month' as RangeType, label: '本月', icon: 'Moon' },
  { value: 'year' as RangeType, label: '今年', icon: 'Star' },
  { value: 'custom' as RangeType, label: '自定义', icon: 'Calendar' },
]

const currentRangeLabel = computed(() => {
  const range = getTimeRange(selectedRange.value, customDateRange.value || undefined)
  if (!range.start || !range.end) return ''
  return `${dayjs(range.start).format('YYYY年MM月DD日')} ~ ${dayjs(range.end).format('YYYY年MM月DD日')}`
})

const canGenerate = computed(() => {
  if (selectedRange.value !== 'custom') return true
  return customDateRange.value && customDateRange.value.length === 2
})

// 报告生成
const isGenerating = ref(false)
const progressText = ref('')
const progressPercent = ref(0)
const showReport = ref(false)
const reportText = ref('')
const reportStats = ref({ commits: 0, repos: 0 })
const isCopying = ref(false)
const showFullscreen = ref(false)
const copyIcon = computed(() => (isCopying.value ? 'Check' : 'CopyDocument'))

// 日期快捷选项
const dateShortcuts = [
  { text: '最近一周', value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 7); return [s, e] } },
  { text: '最近一月', value: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 1); return [s, e] } },
  { text: '最近三月', value: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 3); return [s, e] } },
  { text: '最近半年', value: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 6); return [s, e] } },
]

// ============ 方法 ============

function selectRange(type: RangeType) {
  selectedRange.value = type
  showReport.value = false
}

// Token 登录
async function handleTokenLogin() {
  const t = tokenInput.value.trim()
  if (!t) return

  isLoggingIn.value = true
  try {
    setStoredToken(t)
    const u = await getCurrentUser()
    setStoredUser(u)
    token.value = t
    user.value = u
    tokenInput.value = ''
    ElMessage.success(`欢迎，${u.name || u.login}！`)
  } catch (e: any) {
    clearAuth()
    ElMessage.error(`登录失败：${e.message || '令牌无效'}`)
  } finally {
    isLoggingIn.value = false
  }
}

// OAuth 登录
function handleOAuthLogin() {
  window.location.href = getAuthUrl()
}

// 退出
function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    clearAuth()
    token.value = null
    user.value = null
    showReport.value = false
    reportText.value = ''
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

// 获取 token 指南
function openTokenGuide() {
  window.open('https://gitee.com/profile/personal_access_tokens', '_blank')
}

// 生成报告
async function handleGenerate() {
  if (!token.value) return

  isGenerating.value = true
  showReport.value = false
  progressPercent.value = 0
  progressText.value = '正在获取仓库列表...'

  try {
    // 1. 获取时间范围
    const range = getTimeRange(selectedRange.value, customDateRange.value || undefined)
    if (!range.start || !range.end) {
      ElMessage.warning('请选择完整的时间范围')
      isGenerating.value = false
      return
    }

    // 2. 获取仓库列表
    const repos = await getUserRepos()
    progressPercent.value = 10
    progressText.value = `找到 ${repos.length} 个仓库，正在扫描你的提交记录...`

    // 3. 遍历仓库获取提交（仅筛选当前用户的提交）
    const allItems: ReportItem[] = []
    const total = repos.length

    for (let i = 0; i < total; i++) {
      const repo = repos[i]
      progressText.value = `正在扫描你的提交 ${repo.full_name}（${i + 1}/${total}）...`
      progressPercent.value = 10 + Math.round(((i + 1) / total) * 80)

      try {
        const commits = await getRepoCommits(
          repo.namespace?.path || repo.full_name.split('/')[0],
          repo.path || repo.name,
          range.start,
          range.end,
          user.value?.login,
        )

        if (commits.length > 0) {
          allItems.push(...commitsToReportItems(commits, repo))
        }
      } catch (e) {
        // 跳过无权限的仓库
        console.warn(`跳过仓库 ${repo.full_name}:`, e)
      }
    }

    // 4. 按时间排序
    allItems.sort((a, b) => b.date.localeCompare(a.date))

    // 5. 生成报告
    progressText.value = '正在生成报告...'
    progressPercent.value = 95

    const uniqueRepos = new Set(allItems.map((i) => i.repo)).size
    reportStats.value = { commits: allItems.length, repos: uniqueRepos }

    reportText.value = generateReportText(
      allItems,
      range,
      user.value?.name || user.value?.login || '未知用户',
    )

    progressPercent.value = 100
    progressText.value = '报告生成完成！'

    await new Promise((r) => setTimeout(r, 400))
    showReport.value = true

    ElMessage.success(`报告生成完成！共 ${allItems.length} 次提交，涉及 ${uniqueRepos} 个仓库`)
  } catch (e: any) {
    ElMessage.error(`生成失败：${e.message}`)
  } finally {
    isGenerating.value = false
  }
}

// 全屏显示
function handleFullscreen() {
  showFullscreen.value = true
}

// 复制
async function handleCopy() {
  if (!reportText.value) return
  isCopying.value = true
  const ok = await copyToClipboard(reportText.value)
  if (ok) {
    ElMessage.success('已复制到剪贴板')
  } else {
    ElMessage.warning('复制失败，请手动选择复制')
  }
  setTimeout(() => { isCopying.value = false }, 2000)
}

// ============ 生命周期 ============
onMounted(async () => {
  // 检查 token 是否仍然有效
  if (token.value) {
    try {
      const u = await getCurrentUser()
      user.value = u
      setStoredUser(u)
    } catch {
      clearAuth()
      token.value = null
      user.value = null
    }
  }
})
</script>

<style scoped>
/* ================ 主界面 ================ */
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--primary), var(--accent));
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 12px 4px 4px;
  border-radius: 40px;
  transition: background var(--transition);
}

.user-badge:hover {
  background: var(--bg);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.arrow-down {
  color: var(--text-secondary);
  font-size: 12px;
}

.dropdown-label {
  color: var(--text-secondary);
  font-size: 13px;
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 32px 40px 60px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 配置卡片 */
.config-card {
  overflow: visible;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
}

.step-badge.done {
  background: linear-gradient(135deg, #00b894, #55efc4);
}

.range-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.range-btn {
  flex: 1;
  min-width: 120px;
  height: 52px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid var(--border) !important;
  transition: all var(--transition) !important;
}

.range-btn:not(.active):hover {
  border-color: var(--primary-light) !important;
  color: var(--primary) !important;
  transform: translateY(-2px);
}

.range-btn.active {
  border-color: var(--primary) !important;
  box-shadow: 0 4px 16px rgba(108, 92, 231, 0.25) !important;
}

.custom-range {
  padding: 16px;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

.range-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8f7ff;
  border-radius: 8px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: center;
}

.generate-btn {
  height: 52px !important;
  padding: 0 48px !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  letter-spacing: 1px;
  border-radius: 50px !important;
  box-shadow: 0 8px 30px rgba(108, 92, 231, 0.35) !important;
}

/* 进度卡片 */
.progress-card {
  background: #fafbff !important;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 报告卡片 */
.report-card .card-header {
  margin-bottom: 0;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-textarea {
  margin-top: 16px;
}

.report-textarea :deep(.el-textarea__inner) {
  border-radius: var(--radius-sm);
  font-size: 14px;
  min-height: 420px;
  color: #1a1a2e;
}

/* 页脚 */
.app-footer {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 13px;
  border-top: 1px solid var(--border);
}

/* ================ 登录页面 ================ */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.c1 {
  width: 500px;
  height: 500px;
  background: var(--primary);
  top: -150px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.c2 {
  width: 350px;
  height: 350px;
  background: var(--accent);
  bottom: -80px;
  left: -80px;
  animation: float 8s ease-in-out infinite reverse;
}

.c3 {
  width: 200px;
  height: 200px;
  background: var(--primary-light);
  top: 40%;
  left: 60%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 480px;
  max-width: 90vw;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.hero-icon {
  width: 100px;
  height: 100px;
  border-radius: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  box-shadow: 0 16px 40px rgba(108, 92, 231, 0.35);
  margin-bottom: 24px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.login-card {
  overflow: visible;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.login-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
}

.token-login,
.oauth-login {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.login-hint {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.token-help {
  text-align: right;
}

.oauth-alert {
  border-radius: var(--radius-sm) !important;
}

.oauth-alert code {
  background: #e8ecf1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.login-submit-btn {
  height: 48px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  border-radius: 50px !important;
  margin-top: 4px;
}

.oauth-btn {
  background: linear-gradient(135deg, #24292e, #444d56) !important;
  box-shadow: 0 6px 20px rgba(36, 41, 46, 0.3) !important;
}

.oauth-warning {
  font-size: 12px;
  color: #e17055;
  text-align: center;
}

.oauth-warning code {
  background: #fff3f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.features-row {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.login-footer {
  position: absolute;
  bottom: 24px;
  text-align: center;
  width: 100%;
  color: var(--text-secondary);
  font-size: 13px;
  z-index: 1;
}

/* ================ 响应式 ================ */
@media (max-width: 768px) {
  .top-bar {
    padding: 0 20px;
  }

  .main-content {
    padding: 20px;
  }

  .quick-buttons {
    flex-direction: column;
  }

  .range-btn {
    width: 100%;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .features-row {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
}

/* ================ 全屏弹窗 ================ */
/* 注意：el-dialog teleport 到 body，需要用 :global() 穿透 */
:global(.fullscreen-dialog.el-dialog) {
  display: flex;
  flex-direction: column;
  height: 100% !important;
  margin: 0 !important;
  overflow: hidden;
}

:global(.fullscreen-dialog .el-dialog__header) {
  flex-shrink: 0;
}

:global(.fullscreen-dialog .el-dialog__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  overflow: hidden;
}

.fullscreen-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 16px;
  flex-shrink: 0;
}

.fullscreen-textarea {
  flex: 1;
  display: flex;
}

.fullscreen-textarea :deep(.el-textarea__inner) {
  flex: 1;
  min-height: 0;
  font-size: 15px;
  line-height: 1.9 !important;
  border-radius: var(--radius-sm);
  resize: none;
  color: #1a1a2e;
}
</style>
