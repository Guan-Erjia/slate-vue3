/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor);
};
export const input = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>two</block>
    <block>
      three
      <inline void>four</inline>
      <focus />
      five
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
      five
    </block>
  </editor>
);
