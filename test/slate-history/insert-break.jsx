/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";
import { cloneDeep } from "lodash-es";

const input = (
  <editor>
    <block>
      <block>
        on
        <cursor />e
      </block>
      <block>two</block>
    </block>
  </editor>
);

const output = cloneDeep(input);

test("insert-break", () => {
  const editor = withTest(withHistory(input));
  editor.insertBreak();

  editor.undo();
  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
