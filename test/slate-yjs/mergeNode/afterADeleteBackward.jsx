/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      Hello world!
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.deleteBackward('character');
}
