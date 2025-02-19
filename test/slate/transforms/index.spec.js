import { withTest } from "@test-utils";
import { test, expect, describe } from "vitest";

const modules = import.meta.glob("./**/*.(j|t)s?(x)");

const resolveModules = await Promise.all(
  Object.keys(modules).map(async (path) => {
    const module = await modules[path]();
    module.path = path;
    return module;
  })
);

describe("slate-transforms", () => {
  resolveModules.forEach((module) => {
    const { input, run, output, path, skip } = module;
    test.skipIf(skip)(path, async () => {
      const editor = withTest(input);
      run(editor);

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
