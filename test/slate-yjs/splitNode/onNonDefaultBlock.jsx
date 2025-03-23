/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <h1 id="block1">
      Hello world!
      <cursor />
    </h1>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <h1 id="block1">Hello world!</h1>
    <h1 id="block1">
      <cursor />
    </h1>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export function run(editor) {
  Transforms.splitNodes(editor, { always: true });
}
