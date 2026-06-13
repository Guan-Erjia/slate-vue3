/** @jsx jsx  */
import { Editor } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <element void>
      <text />
    </element>
  </editor>
);
export const test = (editor) => {
  return Array.from(Editor.levels(editor, { at: [0, 0] }));
};
export const output = [
  [input, []],
  [
    <element void>
      <text />
    </element>,
    [0],
  ],
];
