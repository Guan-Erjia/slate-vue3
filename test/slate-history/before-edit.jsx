/** @jsx jsx */
import { withHistory, History } from "slate-history";
import { test, expect } from "vitest";
import { withTest, jsx } from "../utils";

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
