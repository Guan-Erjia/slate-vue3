import { defineConfig, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import typescript from "rollup-plugin-typescript2";

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
        fileName: "slate-vue3",
      },
      rollupOptions: {
        plugins: [
          typescript({
            abortOnError: false,
            tsconfig: `./tsconfig.app.json`,
            clean: true,
          }),
        ],
      },
    };
  }
  return config;
});
