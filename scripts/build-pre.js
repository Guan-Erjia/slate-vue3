import { removeFile } from "./remove.js";
import { exec } from "child_process";
const asyncExec = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });

await removeFile();
asyncExec("tsc -b");
