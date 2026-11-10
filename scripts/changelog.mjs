import { writeFileSync } from "node:fs";
import { argv, stdout } from "node:process";
import { ConventionalChangelog } from "conventional-changelog";

const file = "CHANGELOG.md";
const dryRun = argv.includes("--dry-run");

const generator = new ConventionalChangelog()
  .loadPreset("conventionalcommits")
  .readPackage()
  .readRepository()
  .options({ releaseCount: 0 })
  .tags({ prefix: "v_" });

let body = "";
for await (const chunk of generator.write()) {
  body += chunk;
}

const content = `# Changelog\n\n${body}`;

if (dryRun) {
  stdout.write(content);
} else {
  writeFileSync(file, content);
  stdout.write(`Written to ${file}\n`);
}
