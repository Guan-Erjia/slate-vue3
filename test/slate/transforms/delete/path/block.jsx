/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const run = (editor) => {
  Transforms.delete(editor, { at: [1] });
};
export const output = (
  <editor>
    <block>one</block>
  </editor>
);
