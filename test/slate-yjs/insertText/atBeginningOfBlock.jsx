/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      Welcome to slate-yjs!
      <cursor />
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.insertText('Welcome to slate-yjs!');
}
