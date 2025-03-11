/** @jsx jsx */
import { jsx } from "@test-utils";
import { Transforms } from "slate-vue3";

export const input = (
  <editor>
    <block>
      Initial text <cursor />
    </block>
  </editor>
);
export const run = (editor) => {
  Transforms.insertText(editor, "additional text");
};
