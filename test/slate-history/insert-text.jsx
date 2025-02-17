/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";
import { cloneDeep } from "lodash-es";

const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);

const output = cloneDeep(input);

test("insert-text", () => {
  const editor = withTest(withHistory(input));
  editor.insertText("text");

  editor.undo();
  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
