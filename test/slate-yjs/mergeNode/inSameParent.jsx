/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <text>Welcome </text>
      <text italic>to Slate</text>
      <text bold>YJS!</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Welcome to SlateYJS!</unstyled>
  </editor>
);

export function run(editor) {
  editor.apply({
    type: 'merge_node',
    path: [0, 2],
    position: 0,
    properties: {},
  });
  editor.apply({
    type: 'merge_node',
    path: [0, 1],
    position: 0,
    properties: {},
  });
}
