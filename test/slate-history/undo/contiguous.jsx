/** @jsx jsx */
import { jsx } from "@test-utils";
import { cloneDeep } from "lodash-es";

export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);

export const output = cloneDeep(input);

export const run = (editor) => {
  editor.insertText("t");
  editor.insertText("w");
  editor.insertText("o");
};
