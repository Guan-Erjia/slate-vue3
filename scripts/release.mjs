import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { argv, stdout } from "node:process";
import { ConventionalChangelog } from "conventional-changelog";

const packagePath = "package.json";
const changelogPath = "CHANGELOG.md";
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const dryRun = argv.includes("--dry-run");

function git(args, options = {}) {
  return execFileSync("git", args, {
    encoding: "utf8",
    ...options,
  }).trim();
}

function ensureSigningConfigured() {
  let format;
  try {
    format = git(["config", "--get", "gpg.format"]);
  } catch {
    format = "openpgp";
  }

  if (format === "ssh") {
    try {
      git(["config", "--get", "user.signingkey"]);
      execFileSync("which", ["ssh-keygen"], { stdio: "ignore" });
    } catch {
      throw new Error(
        "SSH signing is not configured. Set gpg.format=ssh and user.signingkey to a key registered in GitHub Settings > SSH and GPG keys > Signing keys.",
      );
    }
    return;
  }

  if (format === "openpgp") {
    try {
      const program = git(["config", "--get", "gpg.program"]) || "gpg";
      execFileSync(program, ["--version"], { stdio: "ignore" });
    } catch {
      throw new Error(
        "GPG signing is not available. Configure SSH signing with a key registered in GitHub, or install and configure GPG before preparing a release.",
      );
    }
    return;
  }

  throw new Error(`Unsupported Git signing format: ${format}.`);
}

function createSignedRelease(version, stageReleaseFiles) {
  if (stageReleaseFiles) {
    git(["add", "--", packagePath, changelogPath]);
  }

  execFileSync(
    "git",
    ["-c", "commit.gpgsign=true", "commit", "-S", "-m", `publish: ${version}`],
    { stdio: "inherit" },
  );
}

async function generateChangelog(version) {
  const generator = new ConventionalChangelog()
    .loadPreset("conventionalcommits")
    .readPackage((currentPackage) => ({ ...currentPackage, version }))
    .readRepository()
    .options({ releaseCount: 0 })
    .tags({ prefix: "v_" });

  let content = "";
  for await (const chunk of generator.write()) {
    content += chunk;
  }

  return `# Changelog\n\n${content}`;
}

if (!dryRun && git(["status", "--porcelain"])) {
  throw new Error("Commit or stash all changes before running pnpm release.");
}

const versionParts = packageJson.version.match(/^(\d+)\.(\d+)\.(\d+)$/);

if (!versionParts) {
  throw new Error(`Unsupported package version: ${packageJson.version}`);
}

const [, major, minor, patch] = versionParts.map(Number);
const nextVersion = `${major}.${minor}.${patch + 1}`;
const changelog = await generateChangelog(nextVersion);

if (dryRun) {
  stdout.write(`Would prepare ${nextVersion}.\n\n${changelog}`);
} else {
  ensureSigningConfigured();
  packageJson.version = nextVersion;
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  writeFileSync(changelogPath, changelog);

  createSignedRelease(nextVersion, true);

  stdout.write(
    `Created signed release commit for ${nextVersion}. Push it to origin, then run the publish workflow.\n`,
  );
}
