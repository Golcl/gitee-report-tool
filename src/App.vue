<template>
  <div class="app-shell">
    <router-view v-slot="{ Component, route }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

// 初始化主题（composable 内部会自动应用）
useTheme()
</script>

<style scoped lang="scss">
.app-shell {
  min-height: 100vh;
}

.page-fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  &-enter-from {
    opacity: 0;
    transform: translateY(12px);
  }

  &-leave-to {
    opacity: 0;
    transform: translateY(-12px);
  }
}
</style>
