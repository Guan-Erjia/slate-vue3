/** @jsx jsx */
import { Transforms, Node } from "slate";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.setNodes(
    editor,
    { someKey: true },
    { match: Node.isText, split: true },
  );
};
export const input = (
  <editor>
    <block>
      w<cursor />
      ord
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      w<cursor />
      ord
    </block>
  </editor>
);
