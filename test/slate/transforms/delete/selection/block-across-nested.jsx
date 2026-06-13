/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor);
};
export const input = (
  <editor>
    <block>
      <block>
        one
        <anchor />
      </block>
      <block>two</block>
    </block>
    <block>
      <block>
        <focus />
        three
      </block>
      <block>four</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        one
        <cursor />
        three
      </block>
    </block>
    <block>
      <block>four</block>
    </block>
  </editor>
);
