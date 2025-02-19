import { withTest } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";
import { Editor } from "slate";

const modules = import.meta.glob("./**/*.js?(x)");

describe("slate-operations", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      const { input, operations, output } = await modules[path]();

      const editor = withTest(reactive(input));
      Editor.withoutNormalizing(editor, () => {
        for (const op of operations) {
          editor.apply(op);
        }
      });

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
