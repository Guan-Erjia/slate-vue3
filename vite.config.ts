import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  base: "/slate-vue3/",
  resolve: {
    alias: {
      slate: path.resolve(__dirname, "./src/slate"),
      "slate-dom": path.resolve(__dirname, "./src/slate-dom"),
      "is-plain-object": path.resolve(__dirname, "./src/is-plain-object"),
    },
  },
});
