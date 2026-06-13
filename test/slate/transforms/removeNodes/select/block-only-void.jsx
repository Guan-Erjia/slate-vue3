/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <block void>
      <cursor />
      one
    </block>
  </editor>
);
export const run = (editor) => {
  Transforms.removeNodes(editor, { at: [0] });
};
export const output = <editor />;
