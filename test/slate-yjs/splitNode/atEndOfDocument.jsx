/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled id="block1">
      Welcome to slate-yjs!
      <cursor />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled id="block1">Welcome to slate-yjs!</unstyled>
    <unstyled id="block1">
      <cursor />
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.splitNodes(editor, { always: true });
}
