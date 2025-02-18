import { withTest, withHistory } from "../../utils";
import { test, expect, describe } from "vitest";
const modules = import.meta.glob("./*.jsx");

describe("undo", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      const { input, run, output } = await modules[path]();
      const editor = withTest(withHistory(input));

      run(editor);
      editor.undo();

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
