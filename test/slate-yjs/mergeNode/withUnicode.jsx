/** @jsx jsxYjs */
import { jsxYjs } from "@test-utils";

export const input = (
  <editor>
    <unstyled id="block1">{"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}</unstyled>
    <unstyled id="block2">
      <cursor />H{"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">
      {"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
      <cursor />H{"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.deleteBackward("character");
}
