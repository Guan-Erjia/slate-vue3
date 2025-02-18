/** @jsx jsx */
import { jsx } from "../../utils";
import { Transforms } from "slate";
import { cloneDeep } from "lodash-es";

export const input = (
  <editor>
    <block>
      <text />
      <inline a>
        o<anchor />
        ne
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline b>
        tw
        <focus />o
      </inline>
      <text />
    </block>
  </editor>
);

export const output = cloneDeep(input);

export const run = (editor) => {
  Transforms.delete(editor);
};
