import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

export const ROUTES_RECORD: RouteRecordRaw[] = [
  {
    name: "rich-text",
    path: "/rich-text",
    component: () => import("./pages/rich-text/index.vue"),
  },
  {
    name: "yjs-liveblocks",
    path: "/yjs-liveblocks/:publicApiKey?",
    component: () => import("./pages/yjs-liveblocks/index.vue"),
  },
  {
    name: "check-lists",
    path: "/check-lists",
    component: () => import("./pages/check-lists/index.vue"),
  },
  {
    name: "editable-voids",
    path: "/editable-voids",
    component: () => import("./pages/editable-voids/index.vue"),
  },
  {
    name: "embeds",
    path: "/embeds",
    component: () => import("./pages/embeds/index.vue"),
  },
  {
    name: "code-highlighting",
    path: "/code-highlighting",
    component: () => import("./pages/code-highlighting/index.vue"),
  },
  {
    name: "cursor-segmentation",
    path: "/cursor-segmentation",
    component: () => import("./pages/cursor-segmentation/index.vue"),
  },
  {
    name: "forced-layout",
    path: "/forced-layout",
    component: () => import("./pages/forced-layout/index.vue"),
  },
  {
    name: "hovering-toolbar",
    path: "/hovering-toolbar",
    component: () => import("./pages/hovering-toolbar/index.vue"),
  },
  {
    name: "huge-document",
    path: "/huge-document",
    component: () => import("./pages/huge-document/index.vue"),
  },
  {
    name: "images",
    path: "/images",
    component: () => import("./pages/images/index.vue"),
  },
  {
    name: "inlines",
    path: "/inlines",
    component: () => import("./pages/inlines/index.vue"),
  },
  {
    name: "markdown-preview",
    path: "/markdown-preview",
    component: () => import("./pages/markdown-preview/index.vue"),
  },
  {
    name: "markdown-shortcuts",
    path: "/markdown-shortcuts",
    component: () => import("./pages/markdown-shortcuts/index.vue"),
  },
  {
    name: "mentions",
    path: "/mentions",
    component: () => import("./pages/mentions/index.vue"),
  },
  {
    name: "paste-html",
    path: "/paste-html",
    component: () => import("./pages/paste-html/index.vue"),
  },
  {
    name: "plain-text",
    path: "/plain-text",
    component: () => import("./pages/plain-text/index.vue"),
  },
  {
    name: "read-only",
    path: "/read-only",
    component: () => import("./pages/read-only/index.vue"),
  },
  {
    name: "search-highlighting",
    path: "/search-highlighting",
    component: () => import("./pages/search-highlighting/index.vue"),
  },
  {
    name: "shadow-dom",
    path: "/shadow-dom",
    component: () => import("./pages/shadow-dom/index.vue"),
  },
  {
    name: "styling",
    path: "/styling",
    component: () => import("./pages/styling/index.vue"),
  },
  {
    name: "tables",
    path: "/tables",
    component: () => import("./pages/tables/index.vue"),
  },
  {
    name: "render-in-iframe",
    path: "/render-in-iframe",
    component: () => import("./pages/render-in-iframe/index.vue"),
  },
  {
    name: "custom-placeholder",
    path: "/custom-placeholder",
    component: () => import("./pages/custom-placeholder/index.vue"),
  },
  {
    path: "/",
    redirect: "/rich-text",
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/rich-text",
  },
];

export const router = createRouter({
  history: createWebHistory("/slate-vue3"),
  routes: ROUTES_RECORD,
});

createApp(App).use(router).mount("#app");
