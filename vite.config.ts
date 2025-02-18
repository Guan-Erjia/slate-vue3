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
    include: ["./test/slate/test-batch-dirty/**/index.spec.js?(x)"],
  },
  resolve: {
    alias: {
      slate: path.resolve(__dirname, "./packages/slate/src/index.ts"),
      "slate-dom": path.resolve(__dirname, "./packages/slate-dom/src/index.ts"),
      "slate-history": path.resolve(
        __dirname,
        "./packages/slate-history/src/index.ts"
      ),
      "slate-vue": path.resolve(__dirname, "./packages/slate-vue/src/index.ts"),
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
        lib: {
          entry: "./packages/slate-vue/src/index.ts",
          name: "slate-vue3",
          fileName: "index",
          formats: ["es"],
        },
        copyPublicDir: false,
      },
      plugins: [
        dts({
          tsconfigPath: "./tsconfig.json",
          rollupTypes: true,
          exclude: ["./packages/docs/**/*", "./test/**/*"],
          compilerOptions: {
            verbatimModuleSyntax: false,
          },
        }),
      ],
    });
  }
  return BaseConfig;
});
