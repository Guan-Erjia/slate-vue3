import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
} from "vue-router";

export const ExampleOptions = [
  {
    name: "rich-text",
    component: () => import("./pages/rich-text/index.vue"),
  },
  {
    name: "check-lists",
    component: () => import("./pages/check-lists/index.vue"),
  },
  {
    name: "editable-voids",
    component: () => import("./pages/editable-voids/index.vue"),
  },
  {
    name: "embeds",
    component: () => import("./pages/embeds/index.vue"),
  },
  {
    name: "code-highlighting",
    component: () => import("./pages/code-highlighting/index.vue"),
  },
  {
    name: 'cursor-segmentation',
    component: () => import("./pages/cursor-segmentation/index.vue"),
  },
  {
    name: "forced-layout",
    component: () => import("./pages/forced-layout/index.vue"),
  },
  {
    name: "hovering-toolbar",
    component: () => import("./pages/hovering-toolbar/index.vue"),
  },
  {
    name: "huge-document",
    component: () => import("./pages/huge-document/index.vue"),
  },
  {
    name: "images",
    component: () => import("./pages/images/index.vue"),
  },
  {
    name: "inlines",
    component: () => import("./pages/inlines/index.vue"),
  },
  {
    name: "markdown-preview",
    component: () => import("./pages/markdown-preview/index.vue"),
  },
  {
    name: "markdown-shortcuts",
    component: () => import("./pages/markdown-shortcuts/index.vue"),
  },
  {
    name: "mentions",
    component: () => import("./pages/mentions/index.vue"),
  },
  {
    name: "paste-html",
    component: () => import("./pages/paste-html/index.vue"),
  },
  {
    name: "plain-text",
    component: () => import("./pages/plain-text/index.vue"),
  },
  {
    name: "read-only",
    component: () => import("./pages/read-only/index.vue"),
  },
  {
    name: "search-highlighting",
    component: () => import("./pages/search-highlighting/index.vue"),
  },
  {
    name: "shadow-dom",
    component: () => import("./pages/shadow-dom/index.vue"),
  },
  {
    name: "styling",
    component: () => import("./pages/styling/index.vue"),
  },
  {
    name: "tables",
    component: () => import("./pages/tables/index.vue"),
  },
  {
    name: "render-in-iframe",
    component: () => import("./pages/render-in-iframe/index.vue"),
  },
  {
    name: "custom-placeholder",
    component: () => import("./pages/custom-placeholder/index.vue"),
  },
];

const routes: RouteRecordRaw[] = ExampleOptions.map((option) => ({
  path: `/${option.name}`,
  component: option.component,
  name: option.name,
}));
routes.push({
  path: "/",
  redirect: "/rich-text",
});
routes.push({
  path: "/:catchAll(.*)",
  redirect: "/rich-text",
});

export const router = createRouter({
  history: createWebHashHistory("/slate-vue3"),
  routes,
});

createApp(App).use(router).mount("#app");
