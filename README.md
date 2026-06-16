# Gitee 工作报告生成器

> 连接你的 Gitee 账号，自动生成周报 / 月报 / 年报，让汇报更轻松。

## 📖 项目简介

基于 Vue 3 + TypeScript + Element Plus 构建的 Gitee 工作报告生成工具。登录 Gitee 后，可快速选择按周、月、年或任意时间段，自动拉取你的提交记录并智能整理为结构化工作报告，支持在线编辑和一键复制。

## ✨ 功能特性

| 功能                | 说明                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| 🔑 **双登录方式**   | 支持「个人访问令牌」和「OAuth 授权」两种登录方式                               |
| 📅 **灵活时间范围** | 本周 / 本月 / 今年快捷选择，也支持自定义任意日期区间                           |
| 🔍 **智能扫描**     | 自动遍历你所有仓库，仅拉取**本人**的提交记录                                   |
| 📊 **智能报告**     | 自动分类提交类型（feat / fix / chore / refactor 等），统计工作量、分析工作重点 |
| ✏️ **在线编辑**     | 生成后可在文本域中自由修改报告内容                                             |
| 🖥️ **全屏预览**     | 支持全屏放大查看和编辑报告                                                     |
| 📋 **一键复制**     | 点击即可将报告复制到剪贴板                                                     |

## 🛠️ 技术栈

| 技术                        | 用途      |
| --------------------------- | --------- |
| **Vue 3** (Composition API) | 前端框架  |
| **TypeScript**              | 类型安全  |
| **Vite**                    | 构建工具  |
| **Element Plus**            | UI 组件库 |
| **Vue Router**              | 前端路由  |
| **dayjs**                   | 日期处理  |
| **Gitee API v5**            | 数据源    |

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

### 安装与运行

```bash
# 1. 进入项目目录
cd 辅助工具

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm run dev

# 4. 打开浏览器访问
# http://localhost:5173
```

### 构建生产版本

```bash
pnpm run build
```

构建产物输出到 `dist/` 目录。

## 🔧 配置说明

### 环境变量（可选）

在项目根目录创建 `.env` 文件：

```env
# Gitee OAuth 应用配置（OAuth 登录方式需要）
VITE_GITEE_CLIENT_ID=your_client_id
VITE_GITEE_CLIENT_SECRET=your_client_secret
VITE_GITEE_REDIRECT_URI=http://localhost:5173/#/callback
```

> **提示**：仅使用「访问令牌登录」无需配置环境变量，推荐作为首选登录方式。

## 📖 使用指南

### 1️⃣ 登录

**方式一：访问令牌登录（推荐）**

1. 打开 [Gitee 个人访问令牌设置页](https://gitee.com/profile/personal_access_tokens)
2. 点击「生成新令牌」，勾选 `projects` 权限
3. 复制生成的令牌，粘贴到应用登录页输入框
4. 点击「登录」

**方式二：OAuth 授权登录**

1. 在 [Gitee OAuth 应用](https://gitee.com/oauth/applications) 创建一个 OAuth 应用
2. 回调地址设置为 `http://localhost:5173/#/callback`
3. 在 `.env` 中配置 `VITE_GITEE_CLIENT_ID` 和 `VITE_GITEE_CLIENT_SECRET`
4. 点击「通过 Gitee 授权登录」

### 2️⃣ 生成报告

1. 选择时间范围（本周 / 本月 / 今年 / 自定义）
2. 点击「生成工作报告」
3. 等待系统扫描所有仓库的提交记录
4. 报告自动生成后，可在文本域中编辑修改

### 3️⃣ 导出报告

- 点击「一键复制」将报告复制到剪贴板
- 点击「放大显示」进入全屏模式查看和编辑

## 📄 报告格式示例

```markdown
## 个人周报 - 用户名（6月8日-6月14日）

### 📊 提交统计

- **总提交数**: 19 条
- **有效提交**: 17 条（不含 2 条合并提交）
- **工作日**: 5 天工作

### 📈 提交类型分布

| 类型      | 数量 | 占比 |
| --------- | ---- | ---- |
| ✨ 新功能 | 8    | 42%  |
| 🐛 修复   | 5    | 26%  |
| 🔧 杂项   | 4    | 21%  |
| 🔀 合并   | 2    | 11%  |

### 📋 详细工作清单

...

### 🎯 工作重点分析

...

### 💡 代码变更情况

...

### ✅ 本周成果总结

...
```

## 📁 项目结构

```
├── index.html                  # HTML 入口
├── package.json                # 项目依赖
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── .env                        # 环境变量
└── src/
    ├── main.ts                 # 应用入口
    ├── App.vue                 # 根组件
    ├── env.d.ts                # 类型声明
    ├── api/
    │   └── gitee.ts           # Gitee API 封装
    ├── router/
    │   └── index.ts           # 路由配置
    ├── types/
    │   └── index.ts           # TypeScript 类型定义
    ├── utils/
    │   └── index.ts           # 工具函数（时间范围/报告生成/剪贴板）
    ├── styles/
    │   └── index.css          # 全局样式
    └── views/
        ├── Home.vue           # 主页面（登录 + 报告生成）
        └── Callback.vue       # OAuth 回调处理
```

## 🧠 核心设计

### 提交分类系统

自动识别 conventional commit 格式和中文关键词，将提交分为以下类型：

| 类型       | 识别规则                                   |
| ---------- | ------------------------------------------ |
| `feat`     | 前缀 `feat:` / 中文"新增""添加""实现"      |
| `fix`      | 前缀 `fix:` / 中文"修复""完善""bug"        |
| `chore`    | 前缀 `chore:` / `perf:` / `ci:` / `build:` |
| `refactor` | 前缀 `refactor:` / 中文"重构""优化"        |
| `docs`     | 前缀 `docs:` / 中文"文档""readme"          |
| `style`    | 前缀 `style:` / 中文"样式""css""ui"        |
| `test`     | 前缀 `test:` / 中文"测试"                  |
| `merge`    | 包含"merge branch" / "合并分支"            |

### 工作重点分析

基于关键词主题聚类，自动识别主要工作方向（如台风预报、决策服务、界面优化等），并计算各模块占比。

## 🧩 依赖

| 包名                    | 版本  | 用途         |
| ----------------------- | ----- | ------------ |
| vue                     | ^3.4  | 前端框架     |
| vue-router              | ^4.3  | 路由         |
| element-plus            | ^2.6  | UI 组件库    |
| @element-plus/icons-vue | ^2.3  | 图标库       |
| dayjs                   | ^1.11 | 日期处理     |
| vite                    | ^5.1  | 构建工具     |
| typescript              | ^5.4  | 类型系统     |
| unplugin-auto-import    | ^0.17 | 自动导入     |
| unplugin-vue-components | ^0.26 | 组件自动注册 |

## 📄 许可证

MIT
