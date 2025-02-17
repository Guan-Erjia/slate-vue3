/** @jsx jsx */
import { Transforms } from "slate-vue";
import { test, expect } from "vitest";
import { withTest, jsx, withHistory, History } from "../utils";

test("after-edit", () => {
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
  Transforms.insertText(editor, "additional text");
  expect(result).toBe(true);
});
