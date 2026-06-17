import { themeDark } from "./dark";
import { themeLight } from "./light";

/** 主题配置类型 */
export type ThemeConfig = typeof themeLight;

/** 主题名称 */
export type ThemeName = "light" | "dark";

/** 所有主题集合 */
export const themes: Record<ThemeName, ThemeConfig> = {
  light: themeLight,
  dark: themeDark,
};

/**
 * 将指定主题的 CSS 变量应用到 document.documentElement
 * 同时切换 html.dark class 以兼容旧的 scoped 样式选择器
 */
export function applyThemeToDocument(themeName: ThemeName) {
  const theme = themes[themeName];
  const root = document.documentElement;

  // 切换 dark class（兼容 html.dark 选择器）
  root.classList.toggle("dark", themeName === "dark");

  // 将所有 CSS 变量注入到 :root
  for (const [key, value] of Object.entries(theme.global)) {
    root.style.setProperty(key, value);
  }
}
