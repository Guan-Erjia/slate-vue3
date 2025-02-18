/** @jsx jsx */
import { jsx } from "@test-utils";
import { Transforms } from "slate";
import { cloneDeep } from "lodash-es";

export const input = (
  <editor>
    <block>
      wo
      <cursor />
      rd
    </block>
  </editor>
);

export const output = cloneDeep(input);

export const run = (editor) => {
  Transforms.delete(editor);
};
