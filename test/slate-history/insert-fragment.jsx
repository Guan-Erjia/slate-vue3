/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";
import { cloneDeep } from "lodash-es";

const input = (
  <editor>
    <block type="d">
      <block>
        <text>
          <cursor />
        </text>
      </block>
    </block>
  </editor>
);

const output = cloneDeep(input);

test("insert-fragment", () => {
  const editor = withTest(withHistory(input));
  const fragment = (
    <block type="d">
      <block>A</block>
      <block type="c">
        <block type="d">
          <block>B</block>
          <block>
            <block type="d">
              <block>C</block>
            </block>
          </block>
        </block>
        <block type="d">
          <block>D</block>
        </block>
      </block>
    </block>
  );
  editor.insertFragment(fragment);

  editor.undo();
  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
