/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor, { reverse: true });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline readOnly>read-only inline</inline>
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text>
        <cursor />
      </text>
    </block>
  </editor>
);
