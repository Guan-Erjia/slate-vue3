/** @jsx jsx */
import { HyperscriptPointRef } from "slate-hyperscript";
import { jsx } from "@test-utils";
import { expect } from "vitest";

const afterOneRef = new HyperscriptPointRef();
const afterTwoRef = new HyperscriptPointRef();

export const input = (
  <editor>
    <element>
      one
      <point ref={afterOneRef} />
      two
      <point ref={afterTwoRef} />
      three
    </element>
  </editor>
);

const afterOne = afterOneRef.point();
const afterTwo = afterTwoRef.point();

export const output = {
  children: [
    {
      children: [
        {
          text: "onetwothree",
        },
      ],
    },
  ],
  selection: null,
};

export function test() {
  expect(afterOne).toStrictEqual({ path: [0, 0], offset: 3 });
  expect(afterTwo).toStrictEqual({ path: [0, 0], offset: 6 });
}
