import { resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";

const modules = await resolveModules(
  import.meta.glob("./fixtures/**/*.(j|t)s?(x)")
);

describe("slate-hyperscript", () => {
  modules.forEach((module) => {
    const { input, test: _test, output, path } = module;
    test(path, () => {
      let actual = {};

      if (Array.isArray(output)) {
        actual = input;
      } else {
        for (const key in output) {
          actual[key] = input[key];
        }
      }

      expect(actual).toStrictEqual(output);
    });
  });
});
