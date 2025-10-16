import * as core from "@actions/core";
import fs from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const path = core.getInput("path");
const packageJson = JSON.parse(
  fs.readFileSync(join(path, "package.json")).toString()
);

const remoteVersions = JSON.parse(
  execSync("npm view slate-vue3 versions --json", {
    encoding: "utf-8",
  })
);

if (packageJson.version === remoteVersions.at(-1)) {
  core.setFailed("版本号未更新");
}

execSync(`echo "version=${packageJson.version}" >> $GITHUB_OUTPUT`);
