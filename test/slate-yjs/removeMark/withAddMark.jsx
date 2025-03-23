/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <text italic>
        <anchor />
        Hello
        <focus /> world!
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <anchor />
      <text bold>Hello</text>
      <focus />
      <text italic> world!</text>
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.addMark('bold', true);
  editor.removeMark('italic');
}
