/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.liftNodes(editor, { at: [0, 0], voids: true });
};
export const input = (
  <editor>
    <block void>
      <block>word</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>word</block>
  </editor>
);
