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
    // semantic-release puts generated release notes (with long commit URLs)
    // in the release commit body, which would exceed the default limits.
    "body-max-line-length": [0, "always"],
    "footer-max-line-length": [0, "always"],
  },
};
