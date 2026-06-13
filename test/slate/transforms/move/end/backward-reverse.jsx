/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.move(editor, { edge: "end", reverse: true });
};
export const input = (
  <editor>
    <block>
      one <focus />
      two t<anchor />
      hree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one <focus />
      two <anchor />
      three
    </block>
  </editor>
);
