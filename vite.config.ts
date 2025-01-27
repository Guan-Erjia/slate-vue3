import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { UserConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  console.log(command, mode);
  const config: UserConfig = {
    plugins: [vue(), vueJsx()],
    base: "/slate-vue3/",
    resolve: {
      alias: {
        slate: path.resolve(__dirname, "./packages/slate/src/index.ts"),
        "slate-dom": path.resolve(
          __dirname,
          "./packages/slate-dom/src/index.ts"
        ),
        "slate-vue": path.resolve(
          __dirname,
          "./packages/slate-vue/src/index.ts"
        ),
        "un-proxy-weakmap": path.resolve(
          __dirname,
          "./packages/un-proxy-weakmap/src/index.ts"
        ),
        "is-plain-object": path.resolve(
          __dirname,
          "./packages/is-plain-object/src/index.ts"
        ),
      },
    },
  };

  if (mode === "lib") {
    config.build = {
      minify: false,
      modulePreload: { polyfill: false },
      lib: {
        entry: "./packages/slate-vue/src/index.ts",
        name: "slate-vue3",
        fileName: "slate-vue3",
      },
    };
  }
  return config;
});
