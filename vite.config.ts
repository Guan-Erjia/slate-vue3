import { defineConfig, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";

export default defineConfig(({ command, mode }) => {
  console.log(command, mode);
  const config: UserConfig = {
    plugins: [vue(), vueJsx()],
    base: "/slate-vue3/",
    resolve: {
      alias: {
        slate: path.resolve(__dirname, "./src/slate"),
        "slate-dom": path.resolve(__dirname, "./src/slate-dom"),
        "is-plain-object": path.resolve(__dirname, "./src/is-plain-object"),
        "slate-vue": path.resolve(__dirname, "./src"),
      },
    },
  };

  if (mode === "lib") {
    config.build = {
      minify: false,
      modulePreload: { polyfill: false },
      lib: {
        entry: "./src/index.ts",
        name: "slate-vue3",
        fileName: "index",
      },
    };
  }
  return config;
});
