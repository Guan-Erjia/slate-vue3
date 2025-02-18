import { withTest, withHistory, History } from "../../utils";
import { test, expect } from "vitest";
const modules = import.meta.glob("./*.jsx");

test("undo", () => {
  Object.keys(modules).forEach(async (path) => {
    const { input, run } = await modules[path]();
    const editor = withTest(withHistory(input));
    run(editor);
    const result = History.isHistory(editor.history);
    expect(result).toBe(true);
  });
});
