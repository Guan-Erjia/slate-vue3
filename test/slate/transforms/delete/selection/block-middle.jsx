/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor);
};
export const input = (
  <editor>
    <block>one</block>
    <block>
      t<anchor />w<focus />o
    </block>
    <block>three</block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>
      t<cursor />o
    </block>
    <block>three</block>
  </editor>
);
