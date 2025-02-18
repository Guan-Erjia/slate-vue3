/** @jsx jsx */
import { jsx } from "@test-utils";
import { cloneDeep } from "lodash-es";

export const input = (
  <editor>
    <block>
      <block>
        on
        <cursor />e
      </block>
      <block>two</block>
    </block>
  </editor>
);

export const output = cloneDeep(input);

export const run = (editor) => {
  editor.insertBreak();
};
