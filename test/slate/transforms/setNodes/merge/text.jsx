/** @jsx jsx */
import { Transforms, Node } from "slate";
import { jsx } from "@test-utils";
import _ from "lodash-es";

export const run = (editor) => {
  Transforms.setNodes(
    editor,
    { a: { b: 2, c: 3 } },
    { at: [0, 0], match: Node.isText, merge: (n, p) => _.defaultsDeep(p, n) },
  );
};
export const input = (
  <editor>
    <block>
      <text a={{ b: 1 }}>word</text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text a={{ b: 2, c: 3 }}>word</text>
    </block>
  </editor>
);
