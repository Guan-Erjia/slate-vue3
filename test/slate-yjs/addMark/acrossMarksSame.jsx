/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <text>
        Hel
        <anchor />l
      </text>
      <text bold>o</text>
      <text>
        {' '}
        w<focus />
        orld!
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text>Hel</text>
      <anchor />
      <text bold>lo w</text>
      <focus />
      <text>orld!</text>
    </unstyled>
  </editor>
);

export function run(editor) {
  editor.addMark('bold', true);
}
