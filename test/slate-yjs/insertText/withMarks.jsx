/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      Hello <cursor />!
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      Hello <text bold>world</text>
      <cursor />!
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.addMark('bold', true);
  editor.insertText('world');
}
