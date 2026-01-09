/** @jsx jsx */
import { Transforms, Node } from "slate";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>one</block>
    <block>
      <cursor />
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  Transforms.mergeNodes(editor, { at: [1, 1], match: Node.isText });
};
export const output = (
  <editor>
    <block>one</block>
    <block>
      <cursor />
    </block>
  </editor>
);
