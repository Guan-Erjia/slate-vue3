/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="block1">
      Hello world!
      <cursor />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">Hello world!</unstyled>
    <h1>
      <cursor />
    </h1>
  </editor>
);

export function run(editor) {
  editor.insertNode({ type: 'unstyled', children: [{ text: '' }] });
  Transforms.setNodes(editor, { type: 'header-one' });
}
