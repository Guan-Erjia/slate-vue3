/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor, { reverse: true });
};
export const input = (
  <editor>
    <block>one</block>
    <block>
      <cursor />
      two
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <cursor />
      two
    </block>
  </editor>
);
