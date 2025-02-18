/** @jsx jsx */
import { jsx } from "../../utils";

export const input = (
  <editor>
    <block>Hello</block>
    <block>
      <cursor />
      world!
    </block>
  </editor>
);

export const output = (
  <editor>
    <block>Hello</block>
    <block>
      <cursor />
      world!
    </block>
  </editor>
);

export const run = (editor) => {
  editor.deleteBackward();
};
