/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <ul>
      <ul-li id="block1">
        Hello world!
        <cursor />
      </ul-li>
    </ul>
    <unstyled />
    <ul>
      <ul-li id="block2">Welcome to slate-yjs!</ul-li>
    </ul>
  </editor>
);

export const expected = (
  <editor>
    <unstyled />
    <ul>
      <ul-li id="block2">Welcome to slate-yjs!</ul-li>
      <ul-li id="block1">
        Hello world!
        <cursor />
      </ul-li>
    </ul>
  </editor>
);

export function run(editor) {
  Transforms.moveNodes(editor, {
    at: [0, 0],
    to: [2, 1],
  });
}
