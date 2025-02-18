import { withTest } from "../../utils.js";
import { test, expect, describe } from "vitest";
import { isProxy, reactive } from "vue";
import { Editor } from "slate";

const modules = import.meta.glob("./**/*.js?(x)");

describe("slate-interface", () => {
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
