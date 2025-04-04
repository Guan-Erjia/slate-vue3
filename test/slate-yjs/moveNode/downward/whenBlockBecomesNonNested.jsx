/** @jsx jsxYjs */
import { Editor } from 'slate';
import { jsxYjs, Transforms } from '@test-utils';

export const input = (
  <editor>
    <ul>
      <ul-li id="block1">
        Hello world!
        <cursor />
      </ul-li>
    </ul>
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
  Editor.withoutNormalizing(editor, () => {
    Transforms.setNodes(
      editor,
      { type: 'unstyled' },
      {
        at: [0, 0],
      }
    );
    Transforms.moveNodes(editor, {
      at: [0, 0],
      to: [2],
    });
  });
}
