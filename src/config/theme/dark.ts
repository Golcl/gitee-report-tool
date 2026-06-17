/**
 * 暗色主题配置
 * 所有 CSS 变量集中管理，通过 JS 动态注入到 :root
 */
export const themeDark = {
  themeName: "dark" as const,
  global: {
    // ----- 主题色（与亮色保持一致）-----
    "--primary": "#6c5ce7",
    "--primary-light": "#a29bfe",
    "--primary-dark": "#4834d4",
    "--accent": "#00cec9",

    // ----- 背景色 -----
    "--bg": "#141414",
    "--card-bg": "#1e1e1e",

    // ----- 文字色 -----
    "--text": "#e8e8e8",
    "--text-secondary": "#999999",

    // ----- 边框色 -----
    "--border": "#2e2e2e",

    // ----- 阴影 -----
    "--shadow": "0 4px 24px rgba(0, 0, 0, 0.3)",
    "--shadow-lg": "0 12px 40px rgba(0, 0, 0, 0.45)",

    // ----- 圆角 -----
    "--radius": "16px",
    "--radius-sm": "10px",

    // ----- 过渡 -----
    "--transition": "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
