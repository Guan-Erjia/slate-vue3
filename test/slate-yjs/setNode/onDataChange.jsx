/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <ul>
      <ul-li id="block1">
        <cursor />
        Hello World!
      </ul-li>
    </ul>
  </editor>
);

export const expected = (
  <editor>
    <ul>
      <ul-li id="block1" checked>
        <cursor />
        Hello World!
      </ul-li>
    </ul>
  </editor>
);

export function run(editor) {
  Transforms.setNodes(
    editor,
    { checked: true },
    {
      mode: 'lowest',
    }
  );
}
