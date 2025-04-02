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
    ...INTRODUCTION_RECORD,
    ...COMPONENTS_RECORD,
    ...HOOKS_RECORD,
    ...PACKAGES_RECORD,
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
