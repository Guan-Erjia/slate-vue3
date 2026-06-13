/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.move(editor, { unit: "word" });
};
export const input = (
  <editor>
    <block>
      one <cursor />
      two three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two
      <cursor /> three
    </block>
  </editor>
);
