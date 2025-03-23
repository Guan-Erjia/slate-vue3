/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="block1">
      H{'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
      <cursor />
      {'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
    </unstyled>
    <unstyled>{'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">H{'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}</unstyled>
    <unstyled id="block1">
      <cursor />
      {'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}
    </unstyled>
    <unstyled>{'Iñtërnâtiônàlizætiøn☃💩\uFEFF'}</unstyled>
  </editor>
);

export function run(editor) {
  Transforms.splitNodes(editor, { always: true });
}
