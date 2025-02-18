import { withTest } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";
import { Editor } from "slate";

const modules = import.meta.glob("./**/*.js?(x)");

describe("slate-normalization", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      const { input, output } = await modules[path]();

      const editor = withTest(reactive(input));
      Editor.normalize(editor, { force: true });

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
