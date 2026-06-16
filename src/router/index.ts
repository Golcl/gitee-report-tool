import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home.vue"),
      meta: { title: "工作报告生成器" },
    },
    {
      path: "/callback",
      name: "callback",
      component: () => import("@/views/Callback.vue"),
      meta: { title: "授权回调" },
    },
  ],
});

router.beforeEach((to) => {
  document.title = (to.meta.title as string) || "Gitee 工作报告生成器";
});

export default router;
