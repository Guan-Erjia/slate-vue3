/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";
import { Transforms } from "slate";
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

test("no-contiguous", () => {
  const editor = withTest(withHistory(input));
  editor.insertText("t");
  Transforms.move(editor, { reverse: true });
  editor.insertText("w");
  Transforms.move(editor, { reverse: true });
  editor.insertText("o");

  editor.undo();
  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
