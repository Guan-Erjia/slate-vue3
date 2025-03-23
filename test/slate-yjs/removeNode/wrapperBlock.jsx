/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="myBlockId">
      <cursor />
      Hello world!
    </unstyled>
    <ul>
      <ul-li>Welcome to slate-yjs!</ul-li>
    </ul>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="myBlockId">
      <cursor />
      Hello world!
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.removeNodes(editor, { at: [1] });
}
