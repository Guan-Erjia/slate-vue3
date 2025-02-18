import { withTest } from "@test-utils";
import { test, expect, describe } from "vitest";
import { Editor } from "slate";

const modules = import.meta.glob("./*.js");

describe("slate-deep-equal", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      const { input, test, output } = await modules[path]();

      if (Editor.isEditor(input)) {
        input = withTest(input);
      }
      const result = test(input);
      expect(result).toStrictEqual(output);
    });
  });
});
