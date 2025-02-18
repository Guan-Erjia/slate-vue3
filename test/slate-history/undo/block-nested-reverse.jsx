/** @jsx jsx */
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block>Hello</block>
    <block>
      <block>
        <cursor />
        world!
      </block>
    </block>
  </editor>
);

export const output = (
  <editor>
    <block>Hello</block>
    <block>
      <block>
        <cursor />
        world!
      </block>
    </block>
  </editor>
);

export const run = (editor) => {
  editor.deleteBackward();
};
