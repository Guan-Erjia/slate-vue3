/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor, { reverse: true });
};
export const input = (
  <editor>
    <block>
      <block>word</block>
      <block>
        <cursor />
        another
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        word
        <cursor />
        another
      </block>
    </block>
  </editor>
);
