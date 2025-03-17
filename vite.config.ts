/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { UserConfig } from "vite";
import dts from "vite-plugin-dts";
import { mergeConfig } from "vite";

const BaseConfig: UserConfig = {
  plugins: [vue()],
  base: "/slate-vue3/",
  test: {
    include: ["./test/**/index.spec.js"],
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "slate-vue3/core": path.resolve(__dirname, "./packages/slate/index.ts"),
      "slate-vue3/dom": path.resolve(
        __dirname,
        "./packages/slate-dom/index.ts"
      ),
      "slate-vue3/hyperscript": path.resolve(
        __dirname,
        "./packages/slate-hyperscript/index.ts"
      ),
      "slate-vue3/history": path.resolve(
        __dirname,
        "./packages/slate-history/index.ts"
      ),
      "slate-vue3": path.resolve(__dirname, "./packages/slate-vue/index.ts"),
      "slate-vue": path.resolve(__dirname, "./packages/slate-vue/index.ts"),
      "slate-hyperscript": path.resolve(
        __dirname,
        "./packages/slate-hyperscript/index.ts"
      ),
      "slate-history": path.resolve(
        __dirname,
        "./packages/slate-history/index.ts"
      ),
      "slate-dom": path.resolve(__dirname, "./packages/slate-dom/index.ts"),
      slate: path.resolve(__dirname, "./packages/slate/index.ts"),
      "share-tools": path.resolve(__dirname, "./packages/share-tools/index.ts"),
      "@test-utils": path.resolve(__dirname, "./test/utils.ts"),
    },
  },
};

export default defineConfig(({ command, mode }) => {
  console.log(command, mode);
  if (mode === "lib") {
    return mergeConfig(BaseConfig, {
      build: {
        minify: false,
        modulePreload: { polyfill: false },
        copyPublicDir: false,
        lib: {
          entry: {
            index: "./packages/slate-vue/index.ts",
            core: "./packages/slate/index.ts",
            dom: "./packages/slate-dom/index.ts",
            history: "./packages/slate-history/index.ts",
            hyperscript: "./packages/slate-hyperscript/index.ts",
          },
          name: "slate-vue3",
          formats: ["es"],
        },
        rollupOptions: {
          external: ["vue"],
        },
      },
      plugins: [
        dts({
          tsconfigPath: "./tsconfig.json",
          exclude: ["./packages/docs/**/*", "./test/**/*"],
          compilerOptions: {
            verbatimModuleSyntax: false,
          },
        }),
      ],
    } as UserConfig);
  }
  return BaseConfig;
});
