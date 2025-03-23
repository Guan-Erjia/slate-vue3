/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <anchor />
      Hello
      <focus /> world!
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <anchor />
      <text bold>Hello</text>
      <focus /> world!
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.addMark('bold', true);
}
