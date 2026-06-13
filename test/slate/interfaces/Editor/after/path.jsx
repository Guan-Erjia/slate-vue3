/** @jsx jsx */

import { Editor } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);

export const test = (editor) => {
  return Editor.after(editor, [0, 0]);
};

export const output = { path: [1, 0], offset: 0 };
