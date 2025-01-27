import { removeFile } from "./remove.js";
import { exec } from "child_process";
const asyncExec = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });

await removeFile()

console.info("generating package declaration...");
await asyncExec("tsc -b");

console.info("building lib...");
await asyncExec("vite build --mode=lib");

console.info("linking declaration...");
await asyncExec(
  "dts-bundle-generator -o ./dist/slate-vue3.d.ts ./packages/slate-vue/dist/index.d.ts --no-check"
);

console.info("finished!");
