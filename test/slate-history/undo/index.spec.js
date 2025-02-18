import { withTest, withHistory } from "../../utils";
import { test, expect } from "vitest";
const modules = import.meta.glob("./*.jsx");

test("undo", () => {
  Object.keys(modules).forEach(async (path) => {
    const { input, run, output } = await modules[path]();
    const editor = withTest(withHistory(input));
    run(editor);
    editor.undo();

    expect(editor.children).toStrictEqual(output.children);
    expect(editor.selection).toStrictEqual(output.selection);
  });
});
