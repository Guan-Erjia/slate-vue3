/** @jsx jsx */
import { test, expect } from "vitest";
import { withTest, jsx, withHistory, History } from "../utils";

test("before-edit", () => {
  const editor = withTest(
    withHistory(
      <editor>
        <block>
          Initial text <cursor />
        </block>
      </editor>
    )
  );
  const result = History.isHistory(editor.history);
  expect(result).toBe(true);
});
