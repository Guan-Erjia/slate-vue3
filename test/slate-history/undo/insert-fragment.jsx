/** @jsx jsx */
import { jsx } from "@test-utils";
import { cloneDeep } from "lodash-es";

export const input = (
  <editor>
    <block type="d">
      <block>
        <text>
          <cursor />
        </text>
      </block>
    </block>
  </editor>
);

export const output = cloneDeep(input);

export const run = (editor) => {
  const fragment = (
    <block type="d">
      <block>A</block>
      <block type="c">
        <block type="d">
          <block>B</block>
          <block>
            <block type="d">
              <block>C</block>
            </block>
          </block>
        </block>
        <block type="d">
          <block>D</block>
        </block>
      </block>
    </block>
  );
  editor.insertFragment(fragment);
};
