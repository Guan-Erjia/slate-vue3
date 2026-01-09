/** @jsx jsx */
import { Editor, Node } from "slate";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>
      one<inline void>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  return Array.from(
    Editor.nodes(editor, { at: [], match: Node.isText, voids: true }),
  );
};
export const output = [
  [<text>one</text>, [0, 0]],
  [<text>two</text>, [0, 1, 0]],
  [<text>three</text>, [0, 2]],
];
