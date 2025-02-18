/** @jsx jsx */
import { Transforms } from "slate-vue";
import { jsx } from "../../utils";

export const input = (
  <editor>
    <block>
      Initial text <cursor />
    </block>
  </editor>
);
export const run = (editor) => {
  Transforms.insertText(editor, "additional text");
  editor.undo();
  editor.redo();
};
