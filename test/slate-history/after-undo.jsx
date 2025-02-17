/** @jsx jsx */
import { Transforms } from "slate-vue";
import { withHistory, History } from "slate-history";
import { test, expect } from "vitest";
import { withTest, jsx } from "../utils";

test("after-undo", () => {
  const editor = withTest(
    withHistory(
      <editor>
        <block>
          Initial text <cursor />
        </block>
      </editor>
    )
  );

  Transforms.insertText(editor, "additional text");
  editor.undo();
  const result = History.isHistory(editor.history);
  expect(result).toBe(true);
});
