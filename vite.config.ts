import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";

export default defineConfig({
  plugins: [vue(), vueJsx()],
  base: "/slate-vue3/",
  resolve: {
    alias: {
      slate: path.resolve(__dirname, "./packages/slate/src/index.ts"),
      "slate-dom": path.resolve(__dirname, "./packages/slate-dom/src/index.ts"),
      "slate-vue": path.resolve(__dirname, "./packages/slate-vue/src/index.ts"),
      "un-proxy-weakmap": path.resolve(__dirname, "./packages/un-proxy-weakmap/src/index.ts"),
    },
  },
  build: {
    minify: false,
  },
});
