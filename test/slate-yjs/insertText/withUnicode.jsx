/** @jsx jsxYjs */
import { jsxYjs } from "@test-utils";

export const input = (
  <editor>
    <unstyled>
      {"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
      <cursor />
      {"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      {"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
      {"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
      <cursor />
      {"Iñtërnâtiônàlizætiøn☃💩\uFEFF"}
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.insertText("Iñtërnâtiônàlizætiøn☃💩\uFEFF");
}
