import { withTest } from "@test-utils";
import { test, expect, describe } from "vitest";

const modules = import.meta.glob("./**/*.(j|t)s?(x)");

describe("slate-transforms", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      const { input, run, output } = await modules[path]();

      const editor = withTest(input);
      run(editor);

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
