/** @jsx jsx */
import { Transforms } from "slate-vue3/core";
import { jsx } from "@test-utils";

export const run = (editor) => {
  Transforms.insertText(editor, "a");
};
export const input = (
  <editor>
    <block>
      first paragraph
      <inline>
        tw
        <anchor />o
      </inline>
    </block>
    <block>
      second
      <focus />
      paragraph
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      first paragraph
      <inline>
        twa
        <cursor />
      </inline>
      paragraph
    </block>
  </editor>
);
