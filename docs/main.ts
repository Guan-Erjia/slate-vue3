import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createRouter, createWebHistory } from "vue-router";
import {
  INTRODUCTION_RECORD,
  COMPONENTS_RECORD,
  HOOKS_RECORD,
  PACKAGES_RECORD,
  EXAMPLE_RECORD,
  ROUTES_RECORD,
} from "./routes";

export const router = createRouter({
  history: createWebHistory("/slate-vue3"),
  routes: [
    {
      name: "introduction",
      path: "/introduction",
      component: () => import("./pages/introduction/index.vue"),
      children: INTRODUCTION_RECORD,
    },
    {
      name: "comps",
      path: "/comps",
      component: () => import("./pages/comps/index.vue"),
      children: COMPONENTS_RECORD,
    },
    {
      name: "hooks",
      path: "/hooks",
      component: () => import("./pages/hooks/index.vue"),
      children: HOOKS_RECORD,
    },
    {
      name: "packages",
      path: "/packages",
      component: () => import("./pages/packages/index.vue"),
      children: PACKAGES_RECORD,
    },
    {
      name: "examples",
      path: "/examples",
      component: () => import("./pages/examples/index.vue"),
      children: EXAMPLE_RECORD,
    },
    ...ROUTES_RECORD,
  ],
});

createApp(App).use(router).mount("#app");
