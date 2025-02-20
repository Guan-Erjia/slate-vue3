import { withTest, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";

const modules = await resolveModules(import.meta.glob("./**/*.(j|t)s?(x)"));

describe("slate-transforms", () => {
  modules.forEach((module) => {
    const { input, run, output, path, skip } = module;
    test.skipIf(skip)(path, async () => {
      const editor = withTest(input);
      run(editor);

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
