/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";
import { Transforms } from "slate";
import { cloneDeep } from "lodash-es";

const input = (
  <editor>
    <block>
      <text />
      <inline a>
        o<anchor />
        ne
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline b>
        tw
        <focus />o
      </inline>
      <text />
    </block>
  </editor>
);

const output = cloneDeep(input);

test("inline-across", () => {
  const editor = withTest(withHistory(input));
  Transforms.delete(editor);

  editor.undo();
  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
