/** @jsx jsx */

import { Editor } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block void>one</block>
  </editor>
);

export const test = (editor) => {
  return Editor.after(editor, { path: [0, 0], offset: 1 }, { voids: true });
};

export const output = { path: [0, 0], offset: 2 };
