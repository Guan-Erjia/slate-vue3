/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>
      <text>
        w<anchor />
        or
        <focus />d
      </text>
    </block>
  </editor>
);
export const run = (editor) => {
  Transforms.insertText(editor, "x", { at: { path: [0, 0], offset: 1 } });
};
export const output = (
  <editor>
    <block>
      wx
      <anchor />
      or
      <focus />d
    </block>
  </editor>
);
