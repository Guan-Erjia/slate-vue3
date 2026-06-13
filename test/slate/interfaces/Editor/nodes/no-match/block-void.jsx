/** @jsx jsx */
import { Editor } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block void>one</block>
  </editor>
);
export const test = (editor) => {
  return Array.from(Editor.nodes(editor, { at: [] }));
};
export const output = [
  [input, []],
  [<block void>one</block>, [0]],
];
