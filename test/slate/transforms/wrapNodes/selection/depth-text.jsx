/** @jsx jsx */
import { Transforms, Node } from "slate";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>
      <text>
        <anchor />
        word
        <focus />
      </text>
    </block>
  </editor>
);
export const run = (editor) => {
  Transforms.wrapNodes(editor, <block new />, { match: Node.isText });
};
export const output = (
  <editor>
    <block>
      <block new>
        <anchor />
        word
        <focus />
      </block>
    </block>
  </editor>
);
