/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor);
};
export const input = (
  <editor>
    <block void>
      <anchor />
    </block>
    <block>one</block>
    <block>
      tw
      <focus />o
    </block>
    <block>three</block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />o
    </block>
    <block>three</block>
  </editor>
);
