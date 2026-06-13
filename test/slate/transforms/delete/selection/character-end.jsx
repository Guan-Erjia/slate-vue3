/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor);
};
export const input = (
  <editor>
    <block>
      wor
      <anchor />d<focus />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      wor
      <cursor />
    </block>
  </editor>
);
