import { withTest, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";
import { Editor } from "slate";

const modules = await resolveModules(import.meta.glob("./**/*.(j|t)s?(x)"));

describe("slate-interface", () => {
  modules.forEach((module) => {
    let { input, test: _test, output, skip, path } = module;
    test.skipIf(skip)(path, () => {
      if (Editor.isEditor(input)) {
        input = withTest(reactive(input));
      }
      const result = _test(input);
      expect(result).toStrictEqual(output);
    });
  });
});
