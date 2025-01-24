import { Plugin } from "vite";
import { exec } from "child_process";

export const DtsPlugin: Plugin = {
  name: "dts-plugin", // 插件名称，可选
  configResolved(config) {
    // 在配置解析后执行的操作，可选
  },
  buildStart() {
    // 构建开始时执行的操作，可选
  },
  buildEnd() {
    exec(
      "dts-bundle-generator -o ./dist/slate-vue3.d.ts ./packages/slate-vue/dist/index.d.ts --no-check"
    );
  },
};
