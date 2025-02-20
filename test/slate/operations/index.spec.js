import { withTest, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";
import { Editor } from "slate";

const modules = await resolveModules(import.meta.glob("./**/*.js?(x)"));

describe("slate-operations", () => {
  modules.forEach((module) => {
    const { input, operations, output, path } = module;
    test(path, () => {
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
