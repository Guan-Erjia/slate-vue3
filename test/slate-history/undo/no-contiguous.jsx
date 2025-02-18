/** @jsx jsx */
import { jsx } from "../../utils";
import { Transforms } from "slate";
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
  Transforms.move(editor, { reverse: true });
  editor.insertText("w");
  Transforms.move(editor, { reverse: true });
  editor.insertText("o");
};
