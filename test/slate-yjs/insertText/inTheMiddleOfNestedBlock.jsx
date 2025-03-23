/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <ul>
      <ul-li>Hello world!</ul-li>
      <ul-li>
        Welcome to <cursor />
      </ul-li>
    </ul>
  </editor>
);

export const expected = (
  <editor>
    <ul>
      <ul-li>Hello world!</ul-li>
      <ul-li>
        Welcome to slate-yjs!
        <cursor />
      </ul-li>
    </ul>
  </editor>
);

export function run(editor) {
  editor.insertText('slate-yjs!');
}
