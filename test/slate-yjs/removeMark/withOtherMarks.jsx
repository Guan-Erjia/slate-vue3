/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <text bold italic>
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
      <text bold italic>
        Hello
      </text>
      <text italic>
        <anchor /> world
        <focus />
      </text>
      <text bold italic>
        !
      </text>
    </unstyled>
  </editor>
);

export const inputRemoteEditor = (
  <editor>
    <unstyled>
      <text bold italic>
        Hello
        <cursor /> world!
      </text>
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.removeMark('bold');
}
