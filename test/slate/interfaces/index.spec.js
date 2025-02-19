import { withTest } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";
import { Editor } from "slate";

const modules = import.meta.glob("./**/*.(j|t)s?(x)");

const resolveModules = await Promise.all(
  Object.keys(modules).map(async (path) => {
    const module = await modules[path]();
    module.path = path;
    return module;
  })
);

describe("slate-interface", () => {
  resolveModules.forEach((module) => {
    let { input, test: _test, output, skip, path } = module;
    test.skipIf(skip)(path, () => {
      if (Editor.isEditor(input)) {
        input = withTest(reactive(input));
      } else {
        input = input;
      }
      const result = _test(input);
      expect(result).toStrictEqual(output);
    });
  });
});
