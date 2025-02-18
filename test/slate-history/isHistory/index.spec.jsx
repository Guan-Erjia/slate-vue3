/** @jsx jsx */
import { withTest, withHistory, History } from "../../utils";
import { test, expect } from "vitest";
import { jsx } from "../../utils";

const modules = import.meta.glob("./*.jsx");

const input = (
  <editor>
    <block>
      Initial text <cursor />
    </block>
  </editor>
);

test("isHistory", () => {
  Object.keys(modules).forEach(async (path) => {
    const { run } = await modules[path]();
    const editor = withTest(withHistory(input));
    run(editor);
    const result = History.isHistory(editor.history);
    expect(result).toBe(true);
  });
});
