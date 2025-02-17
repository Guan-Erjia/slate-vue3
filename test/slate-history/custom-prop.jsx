/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";
import { Transforms } from "slate";
import { cloneDeep } from "lodash-es";

const input = (
  <editor>
    <block a>
      o<anchor />
      ne
    </block>
    <block b>
      tw
      <focus />o
    </block>
  </editor>
);

const output = cloneDeep(input);

test("block-text", () => {
  const editor = withTest(withHistory(input));
  Transforms.delete(editor);

  editor.undo();
  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
