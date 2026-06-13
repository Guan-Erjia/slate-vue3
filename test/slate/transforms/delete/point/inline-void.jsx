/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor);
};
export const input = (
  <editor>
    <block>
      word
      <cursor />
    </block>
    <block>
      <text />
      <inline void>
        <text />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      word
      <cursor />
      <inline void>
        <text />
      </inline>
      <text />
    </block>
  </editor>
);
