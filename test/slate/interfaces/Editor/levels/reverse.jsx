/** @jsx jsx  */
import { Editor } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (editor) => {
  return Array.from(
    Editor.levels(editor, {
      at: [0, 0],
      reverse: true,
    }),
  );
};
export const output = [
  [<text />, [0, 0]],
  [
    <element>
      <text />
    </element>,
    [0],
  ],
  [input, []],
];
