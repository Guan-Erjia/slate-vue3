import { RouteRecordRaw } from "vue-router";

export const INTRODUCTION_RECORD: RouteRecordRaw[] = [
  {
    name: "get-start",
    path: "get-start",
    component: () => import("./pages/introduction/get-start.vue"),
  },
  {
    name: "what-difference",
    path: "what-difference",
    component: () => import("./pages/introduction/what-difference.vue"),
  },
];

export const COMPONENTS_RECORD: RouteRecordRaw[] = [
  {
    name: "<Slate />",
    path: "slate",
    component: () => import("./pages/comps/slate.vue"),
  },
  {
    name: "<Editable />",
    path: "editable",
    component: () => import("./pages/comps/editable.vue"),
  },
];

export const HOOKS_RECORD: RouteRecordRaw[] = [
  {
    name: "use-editor",
    path: "use-editor",
    component: () => import("./pages/hooks/use-editor.vue"),
  },
  {
    name: "use-composing",
    path: "use-composing",
    component: () => import("./pages/hooks/use-composing.vue"),
  },
  {
    name: "use-focused",
    path: "use-focused",
    component: () => import("./pages/hooks/use-focused.vue"),
  },
  {
    name: "use-read-only",
    path: "use-read-only",
    component: () => import("./pages/hooks/use-read-only.vue"),
  },
  {
    name: "use-selected",
    path: "use-selected",
    component: () => import("./pages/hooks/use-selected.vue"),
  },
  {
    name: "use-selection",
    path: "use-selection",
    component: () => import("./pages/hooks/use-selection.vue"),
  },
  {
    name: "use-inherit-ref",
    path: "use-inherit-ref",
    component: () => import("./pages/hooks/use-inherit-ref.vue"),
  },
];

export const PACKAGES_RECORD: RouteRecordRaw[] = [
  {
    name: "slate-vue3/core",
    path: "slate",
    component: () => import("./pages/packages/core.vue"),
  },
  {
    name: "slate-vue3/dom",
    path: "slate-dom",
    component: () => import("./pages/packages/dom.vue"),
  },
  {
    name: "slate-vue3/history",
    path: "slate-history",
    component: () => import("./pages/packages/history.vue"),
  },
  {
    name: "slate-vue3/yjs",
    path: "slate-yjs",
    component: () => import("./pages/packages/yjs.vue"),
  },
  {
    name: "slate-vue3/hyperscript",
    path: "slate-hyperscript",
    component: () => import("./pages/packages/hyperscript.vue"),
  },
];

export const EXAMPLE_RECORD: RouteRecordRaw[] = [
  {
    name: "rich-text",
    path: "rich-text",
    component: () => import("./pages/examples/rich-text/index.vue"),
  },
  {
    name: "remote-simple",
    path: "remote-simple",
    component: () => import("./pages/examples/remote-simple/index.vue"),
  },
  {
    name: "remote-cursor",
    path: "remote-cursor",
    component: () => import("./pages/examples/remote-cursor/index.vue"),
  },
  {
    name: "check-lists",
    path: "check-lists",
    component: () => import("./pages/examples/check-lists/index.vue"),
  },
  {
    name: "editable-voids",
    path: "editable-voids",
    component: () => import("./pages/examples/editable-voids/index.vue"),
  },
  {
    name: "embeds",
    path: "embeds",
    component: () => import("./pages/examples/embeds/index.vue"),
  },
  {
    name: "code-highlighting",
    path: "code-highlighting",
    component: () => import("./pages/examples/code-highlighting/index.vue"),
  },
  {
    name: "cursor-segmentation",
    path: "cursor-segmentation",
    component: () => import("./pages/examples/cursor-segmentation/index.vue"),
  },
  {
    name: "forced-layout",
    path: "forced-layout",
    component: () => import("./pages/examples/forced-layout/index.vue"),
  },
  {
    name: "hovering-toolbar",
    path: "hovering-toolbar",
    component: () => import("./pages/examples/hovering-toolbar/index.vue"),
  },
  {
    name: "huge-document",
    path: "huge-document",
    component: () => import("./pages/examples/huge-document/index.vue"),
  },
  {
    name: "images",
    path: "images",
    component: () => import("./pages/examples/images/index.vue"),
  },
  {
    name: "inlines",
    path: "inlines",
    component: () => import("./pages/examples/inlines/index.vue"),
  },
  {
    name: "markdown-preview",
    path: "markdown-preview",
    component: () => import("./pages/examples/markdown-preview/index.vue"),
  },
  {
    name: "markdown-shortcuts",
    path: "markdown-shortcuts",
    component: () => import("./pages/examples/markdown-shortcuts/index.vue"),
  },
  {
    name: "mentions",
    path: "mentions",
    component: () => import("./pages/examples/mentions/index.vue"),
  },
  {
    name: "paste-html",
    path: "paste-html",
    component: () => import("./pages/examples/paste-html/index.vue"),
  },
  {
    name: "plain-text",
    path: "plain-text",
    component: () => import("./pages/examples/plain-text/index.vue"),
  },
  {
    name: "read-only",
    path: "read-only",
    component: () => import("./pages/examples/read-only/index.vue"),
  },
  {
    name: "search-highlighting",
    path: "search-highlighting",
    component: () => import("./pages/examples/search-highlighting/index.vue"),
  },
  {
    name: "shadow-dom",
    path: "shadow-dom",
    component: () => import("./pages/examples/shadow-dom/index.vue"),
  },
  {
    name: "styling",
    path: "styling",
    component: () => import("./pages/examples/styling/index.vue"),
  },
  {
    name: "tables",
    path: "tables",
    component: () => import("./pages/examples/tables/index.vue"),
  },
  {
    name: "render-in-iframe",
    path: "render-in-iframe",
    component: () => import("./pages/examples/render-in-iframe/index.vue"),
  },
  {
    name: "custom-placeholder",
    path: "custom-placeholder",
    component: () => import("./pages/examples/custom-placeholder/index.vue"),
  },
];

export const ROUTES_RECORD: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/introduction/get-start",
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/introduction/get-start",
  },
];
