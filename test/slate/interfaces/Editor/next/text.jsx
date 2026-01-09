/** @jsx jsx */
import { Editor, Node } from "slate";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) => {
  return Editor.next(editor, { at: [0], match: Node.isText });
};
export const output = [<text>two</text>, [1, 0]];
