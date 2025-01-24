import fs from "fs-extra";
import { exec } from "child_process";
const asyncExec = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });

await fs.remove("./packages/slate/dist");
await fs.remove("./packages/slate-dom/dist");
await fs.remove("./packages/slate-vue/dist");
await fs.remove("./packages/un-proxy-weakmap/dist");
await fs.remove("./packages/slate/tsconfig.tsbuildinfo");
await fs.remove("./packages/slate-dom/tsconfig.tsbuildinfo");
await fs.remove("./packages/slate-vue/tsconfig.tsbuildinfo");
await fs.remove("./packages/un-proxy-weakmap/tsconfig.tsbuildinfo");

asyncExec("tsc -b");
