import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { UserConfig } from "vite";
import dts from "vite-plugin-dts";

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
        "share-tools": path.resolve(
          __dirname,
          "./packages/share-tools/src/index.ts"
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
    config.plugins?.push(dts({
      tsconfigPath: "./tsconfig.json",
      rollupTypes: true,
      exclude: ["./packages/docs/**/*"],
      compilerOptions: {
        verbatimModuleSyntax: false
      }
    }));
  }
  return config;
});
