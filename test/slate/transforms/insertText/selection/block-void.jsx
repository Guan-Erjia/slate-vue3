/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.insertText(editor, "a");
};
export const input = (
  <editor>
    <block void>
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block void>
      <cursor />
    </block>
  </editor>
);
