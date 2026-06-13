/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor, { unit: "line" });
};
export const input = (
  <editor>
    <block>
      one two thr
      <cursor />
      ee
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two thr
      <cursor />
    </block>
  </editor>
);
