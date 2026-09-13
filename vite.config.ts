/// <reference types="vitest/config" />
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import dts from "unplugin-dts/vite";
import babel from "vite-plugin-babel";
import eslint from "vite-plugin-eslint2";

const BaseConfig: UserConfig = {
  oxc: {
    jsx: {
      runtime: "classic",
      pragma: "jsx",
      development: false,
    },
  },
  plugins: [
    vue(),
    eslint({
      include: ["src/**/*.{js,vue}"], // 检查范围
      cache: true, // 启用缓存提高性能
    }),
  ],
  base: "/slate-vue3/",
  test: {
    include: [
      "./test/slate-yjs/**/index.spec.ts",
      "./test/slate-vue/**/*.spec.ts",
    ],
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "slate-vue3/yjs": path.resolve(
        import.meta.dirname,
        "./packages/slate-yjs/index.ts",
      ),
      "slate-vue3/dom": path.resolve(
        import.meta.dirname,
        "./packages/slate-dom/index.ts",
      ),
      "slate-vue3": path.resolve(
        import.meta.dirname,
        "./packages/slate-vue/index.ts",
      ),
      "@test-utils": path.resolve(import.meta.dirname, "./test/utils.ts"),
    },
  },
};

export default defineConfig(({ command, mode }) => {
  console.log(command, mode);
  if (mode === "lib" || mode === "lib-watch") {
    return mergeConfig(BaseConfig, {
      build: {
        minify: false,
        sourcemap: mode === "lib-watch",
        watch: mode === "lib-watch" ? {} : undefined,
        modulePreload: { polyfill: false },
        copyPublicDir: false,
        lib: {
          entry: {
            index: "./packages/slate-vue/index.ts",
            dom: "./packages/slate-dom/index.ts",
            yjs: "./packages/slate-yjs/index.ts",
          },
          name: "slate-vue3",
          formats: ["es"],
        },
        rollupOptions: {
          external: ["vue", "yjs"],
        },
      },
      plugins: [
        dts({
          tsconfigPath: "./tsconfig.json",
          entryRoot: "packages",
          exclude: ["./packages/docs/**/*", "./test/**/*"],
          compilerOptions: {
            verbatimModuleSyntax: false,
          },
        }),
      ],
    } as UserConfig);
  }

  if (mode === "build") {
    return mergeConfig(BaseConfig, {
      plugins: [
        babel({
          babelConfig: {
            plugins: [["babel-plugin-transform-regex"]],
          },
        }),
      ],
    });
  }

  return BaseConfig;
});
