import fs from "fs-extra";

export const removeFile = async () => {
  await fs.remove("./packages/slate/dist");
  await fs.remove("./packages/slate-dom/dist");
  await fs.remove("./packages/slate-vue/dist");
  await fs.remove("./packages/un-proxy-weakmap/dist");
  await fs.remove("./packages/is-plain-object/dist");
  await fs.remove("./packages/slate/tsconfig.tsbuildinfo");
  await fs.remove("./packages/slate-dom/tsconfig.tsbuildinfo");
  await fs.remove("./packages/slate-vue/tsconfig.tsbuildinfo");
  await fs.remove("./packages/un-proxy-weakmap/tsconfig.tsbuildinfo");
  await fs.remove("./packages/is-plain-object/tsconfig.tsbuildinfo");
  console.info("clean dist finished");
};
