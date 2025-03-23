/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      {'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
      <anchor />
      {'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
      <focus />
      {'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      {'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
      <cursor />
      {'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.delete(editor);
}
