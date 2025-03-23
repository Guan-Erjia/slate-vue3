/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="block1">Hello world!</unstyled>
    <ul>
      <ul-li>
        <cursor />
        Welcome to slate-yjs!
      </ul-li>
    </ul>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">
      Hello world!
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.deleteBackward('character');
}
