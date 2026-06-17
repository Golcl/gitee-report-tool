import { ref, watchEffect } from "vue";
import { applyThemeToDocument } from "../config/theme";
import type { ThemeName } from "../config/theme";

const THEME_KEY = "gitee-report-theme";
const theme = ref<ThemeName>(
  (localStorage.getItem(THEME_KEY) as ThemeName) || "light",
);

// 将主题应用到 document
function applyTheme(t: ThemeName) {
  applyThemeToDocument(t);
  localStorage.setItem(THEME_KEY, t);
}

// 初始化时立即应用
applyTheme(theme.value);

// 监听变化
watchEffect(() => applyTheme(theme.value));

export function useTheme() {
  const isDark = () => theme.value === "dark";

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }

  return { theme, isDark, toggleTheme };
}
