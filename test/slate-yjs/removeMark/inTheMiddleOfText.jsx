/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        Hello
        <anchor /> world
        <focus />!
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text bold>Hello</text>
      <text>
        <anchor /> world
        <focus />
      </text>
      <text bold>!</text>
    </unstyled>
  </editor>
);

export const inputRemoteEditor = (
  <editor>
    <unstyled>
      <text bold>
        Hello
        <cursor /> world!
      </text>
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.removeMark('bold');
}
