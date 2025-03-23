/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      Hello <anchor />
      world!
      <focus />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      Hello{' '}
      <text bold>
        <anchor />
        world!
      </text>
      <focus />
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.addMark('bold', true);
}
