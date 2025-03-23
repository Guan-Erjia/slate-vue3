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
      Hello world
      <cursor />!
    </unstyled>
  </editor>
);

export const inputRemoteEditor = (
  <editor>
    <unstyled>
      Hello !<cursor />
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.insertText('world');
}
