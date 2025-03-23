/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <note-link entityId="myEntity">
        Hello <cursor />!
      </note-link>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <note-link entityId="myEntity">
        Hello world
        <cursor />!
      </note-link>
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.insertText('world');
}
