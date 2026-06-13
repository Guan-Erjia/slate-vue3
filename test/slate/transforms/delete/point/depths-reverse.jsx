/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.delete(editor, { reverse: true });
};
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
    <block>
      Hello
      <cursor />
      world!
    </block>
  </editor>
);
