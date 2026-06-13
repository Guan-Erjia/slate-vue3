/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.insertText(editor, "a");
};
export const input = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>two</block>
    <block>
      <focus />
      three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      a<cursor />
      three
    </block>
  </editor>
);
export const skip = true;
