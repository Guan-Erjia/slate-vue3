/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="block1">
      <cursor />
      Hello world!
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <h1 id="block1">
      <cursor />
      Hello world!
    </h1>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export function run(editor) {
  Transforms.setNodes(editor, { type: 'header-one' });
}
