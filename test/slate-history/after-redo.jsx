/** @jsx jsx */
import { Transforms } from "slate-vue";
import { test, expect } from "vitest";
import { withTest, jsx, withHistory, History } from "../utils";

test("after-redo", () => {
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
  editor.redo();
  const result = History.isHistory(editor.history);
  expect(result).toBe(true);
});
