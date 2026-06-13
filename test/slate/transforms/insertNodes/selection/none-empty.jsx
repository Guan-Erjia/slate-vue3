/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = <editor />;
export const run = (editor, options = {}) => {
  Transforms.insertNodes(editor, <block>one</block>, options);
};
export const output = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);
