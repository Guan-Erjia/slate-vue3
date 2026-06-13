/** @jsx jsx */

import { Editor } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block void>one</block>
    <block void>two</block>
  </editor>
);

export const test = (editor) => {
  return Editor.before(editor, [1, 0], { voids: true });
};

export const output = { path: [0, 0], offset: 3 };
