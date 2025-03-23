/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="block1">Hello world!</unstyled>
    <h1 id="block2">
      <cursor />
      Welcome to slate-yjs!
    </h1>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">Hello world!</unstyled>
    <unstyled id="block2">
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.setNodes(editor, { type: 'unstyled', id: 'block2' });
}
