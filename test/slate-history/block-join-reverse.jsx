/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";

const input = (
  <editor>
    <block>Hello</block>
    <block>
      <cursor />
      world!
    </block>
  </editor>
);

const output = (
  <editor>
    <block>Hello</block>
    <block>
      <cursor />
      world!
    </block>
  </editor>
);

test("block-join-reverse", () => {
  const editor = withTest(withHistory(input));
  editor.deleteBackward();
  editor.undo();

  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
