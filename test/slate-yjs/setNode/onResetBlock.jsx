/** @jsx jsxYjs */
import { Editor, Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <h1 id="block1">
      <cursor />
      Hello world!
    </h1>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block2">
      <cursor />
      Hello world!
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export function run(editor) {
  Transforms.setNodes(editor, { type: 'unstyled', id: 'block2' });
}
