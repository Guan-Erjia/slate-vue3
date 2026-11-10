export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // `publish` is used by the manual release commits and `fork` marks changes
    // ported from upstream slate-react; keep both allowed on top of the
    // conventional types.
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "fork",
        "perf",
        "publish",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
  },
};
