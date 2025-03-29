import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createRouter, createWebHistory } from "vue-router";
import { ROUTES_RECORD } from "./routes";

export const router = createRouter({
  history: createWebHistory("/slate-vue3"),
  routes: ROUTES_RECORD,
});

createApp(App).use(router).mount("#app");
