/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <anchor />
      <text italic>Hello world</text>
      <focus />
      <text bold>!</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <anchor />
      <text italic bold>
        Hello world
      </text>
      <focus />
      <text bold>!</text>
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.addMark('bold', true);
}
