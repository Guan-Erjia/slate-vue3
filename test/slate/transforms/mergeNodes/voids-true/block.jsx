/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block void>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
);
export const run = (editor) => {
  Transforms.mergeNodes(editor, { at: [0, 1], voids: true });
};
export const output = (
  <editor>
    <block void>onetwo</block>
  </editor>
);
