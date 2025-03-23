/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="block1">
      Hello world!
      <cursor />
    </unstyled>
    <unstyled id="block2">Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block2">Welcome to slate-yjs!</unstyled>
    <unstyled id="block1">
      Hello world!
      <cursor />
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.moveNodes(editor, {
    at: [0],
    to: [1],
  });
}
