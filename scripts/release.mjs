import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { argv, cwd, exit, stdout } from "node:process";
import { analyzeCommits } from "@semantic-release/commit-analyzer";
import { ConventionalChangelog } from "conventional-changelog";

const packagePath = "package.json";
const changelogPath = "CHANGELOG.md";
const releaseConfig = JSON.parse(readFileSync(".releaserc.json", "utf8"));
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
    [
      "-c",
      "commit.gpgsign=true",
      "commit",
      "-S",
      "-m",
      `chore(release): ${version} [skip ci]`,
    ],
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

const branch = git(["branch", "--show-current"]);
const releaseBranches = Array.isArray(releaseConfig.branches)
  ? releaseConfig.branches
  : [releaseConfig.branches];

if (!releaseBranches.includes(branch)) {
  throw new Error(
    `Releases are only allowed from ${releaseBranches.join(", ")}; current branch is ${branch}.`,
  );
}

const latestTag = git([
  "describe",
  "--tags",
  "--match",
  "v_[0-9]*",
  "--abbrev=0",
]);
const taggedVersion = latestTag.slice("v_".length);

if (packageJson.version !== taggedVersion) {
  const committedPackage = JSON.parse(git(["show", `HEAD:${packagePath}`]));
  const stagedFiles = git(["diff", "--cached", "--name-only"])
    .split("\n")
    .filter(Boolean)
    .sort();
  const unstagedReleaseFiles = git([
    "diff",
    "--name-only",
    "--",
    packagePath,
    changelogPath,
  ])
    .split("\n")
    .filter(Boolean);
  const expectedFiles = [changelogPath, packagePath].sort();
  const stagedIsReleaseFiles =
    stagedFiles.length === 0 ||
    stagedFiles.join("\n") === expectedFiles.join("\n");
  const unstagedIsReleaseFiles =
    unstagedReleaseFiles.length === 0 ||
    [...unstagedReleaseFiles].sort().join("\n") === expectedFiles.join("\n");

  if (
    committedPackage.version !== taggedVersion ||
    !stagedIsReleaseFiles ||
    !unstagedIsReleaseFiles ||
    (stagedFiles.length > 0 && unstagedReleaseFiles.length > 0)
  ) {
    throw new Error(
      `package.json is ${packageJson.version}, but the latest release tag is ${latestTag}. Only a failed release with package.json and CHANGELOG.md pending can be resumed; inspect or commit other changes first.`,
    );
  }

  if (dryRun) {
    stdout.write(
      `Would resume signed release commit for ${packageJson.version}.\n`,
    );
  } else {
    ensureSigningConfigured();
    createSignedRelease(packageJson.version, stagedFiles.length === 0);
    stdout.write(
      `Created signed release commit for ${packageJson.version}. Push it to origin, then run the publish workflow; it creates the tag after publishing.\n`,
    );
  }
  exit(0);
}

if (!dryRun && git(["status", "--porcelain"])) {
  throw new Error(
    "Commit or stash all changes before running pnpm release; the release commit must contain only package.json and CHANGELOG.md.",
  );
}

const analyzerPlugin = releaseConfig.plugins.find(
  (plugin) =>
    Array.isArray(plugin) && plugin[0] === "@semantic-release/commit-analyzer",
);

if (!analyzerPlugin) {
  throw new Error("Could not find @semantic-release/commit-analyzer config.");
}

const rawCommits = git([
  "log",
  `${latestTag}..HEAD`,
  "--pretty=format:%H%x1f%B%x1e",
]);
const commits = rawCommits
  .split("\x1e")
  .filter((record) => record.trim())
  .map((record) => {
    const [hash, ...message] = record.trim().split("\x1f");
    return { hash, message: message.join("\x1f").trim() };
  });
const releaseType = await analyzeCommits(analyzerPlugin[1] ?? {}, {
  commits,
  cwd: cwd(),
  logger: { log() {} },
});

if (!releaseType) {
  stdout.write(`No release-worthy commits since ${latestTag}.\n`);
} else {
  const versionParts = packageJson.version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!versionParts) {
    throw new Error(`Unsupported package version: ${packageJson.version}`);
  }

  let [, major, minor, patch] = versionParts.map(Number);

  if (releaseType === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (releaseType === "minor") {
    minor += 1;
    patch = 0;
  } else if (releaseType === "patch") {
    patch += 1;
  } else {
    throw new Error(`Unsupported release type: ${releaseType}`);
  }

  const nextVersion = `${major}.${minor}.${patch}`;
  const changelog = await generateChangelog(nextVersion);

  if (dryRun) {
    stdout.write(
      `Would prepare ${nextVersion} (${releaseType}).\n\n${changelog}`,
    );
  } else {
    ensureSigningConfigured();
    packageJson.version = nextVersion;
    writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
    writeFileSync(changelogPath, changelog);

    createSignedRelease(nextVersion, true);

    stdout.write(
      `Created signed release commit for ${nextVersion}. Push it to origin, then run the publish workflow; it creates the tag after publishing.\n`,
    );
  }
}
