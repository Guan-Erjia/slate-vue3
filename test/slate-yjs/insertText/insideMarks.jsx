/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        Hello <cursor />!
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text bold>
        Hello world
        <cursor />!
      </text>
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.insertText('world');
}
