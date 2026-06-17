/**
 * 亮色主题配置
 * 所有 CSS 变量集中管理，通过 JS 动态注入到 :root
 */
export const themeLight = {
  themeName: "light" as const,
  global: {
    // ----- 主题色 -----
    "--primary": "#6c5ce7",
    "--primary-light": "#a29bfe",
    "--primary-dark": "#4834d4",
    "--accent": "#00cec9",

    // ----- 背景色 -----
    "--bg": "#f0f2f8",
    "--card-bg": "#ffffff",

    // ----- 文字色 -----
    "--text": "#2d3436",
    "--text-secondary": "#636e72",

    // ----- 边框色 -----
    "--border": "#e8ecf1",

    // ----- 阴影 -----
    "--shadow": "0 4px 24px rgba(0, 0, 0, 0.06)",
    "--shadow-lg": "0 12px 40px rgba(0, 0, 0, 0.1)",

    // ----- 圆角 -----
    "--radius": "16px",
    "--radius-sm": "10px",

    // ----- 过渡 -----
    "--transition": "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
