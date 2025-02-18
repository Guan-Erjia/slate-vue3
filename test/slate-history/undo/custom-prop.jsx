/** @jsx jsx */
import { jsx } from "../../utils";
import { Transforms } from "slate";
import { cloneDeep } from "lodash-es";

export const input = (
  <editor>
    <block a>
      o<anchor />
      ne
    </block>
    <block b>
      tw
      <focus />o
    </block>
  </editor>
);

export const output = cloneDeep(input);

export const run = (editor) => {
  Transforms.delete(editor);
};
