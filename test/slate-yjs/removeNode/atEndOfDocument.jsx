/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <cursor />
      Hello world!
    </unstyled>
    <unstyled id="myBlockId">Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <cursor />
      Hello world!
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.removeNodes(editor, { at: [1] });
}
