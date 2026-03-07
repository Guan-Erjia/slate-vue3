/** @jsx jsx  */
import { Node } from "slate";
import { jsx } from "@test-utils";

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => {
  try {
    return Node.getIf(value, ["__proto__"]);
  } catch (error) {
    return error.message;
  }
};
export const output = "Got non-numeric path index";
