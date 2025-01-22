import { defineConfig, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import typescript from "rollup-plugin-typescript2";

export default defineConfig({
  plugins: [vue(), vueJsx()],
  base: "/slate-vue3/",
  build: {
    minify: false,
    modulePreload: { polyfill: false },
    lib: {
      entry: "./src/index.ts",
      name: "slate-vue3",
      fileName: "index",
    },
    rollupOptions: {
      plugins: [
        typescript({
          abortOnError: false,
          tsconfig: `./tsconfig.app.json`,
          clean: true,
          check: false,
        }),
      ],
    },
  },
});
