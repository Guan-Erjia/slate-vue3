/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      Welcome to slate-yjs!
      <cursor />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
    <h1>
      Foo bar!
      <cursor />
    </h1>
  </editor>
);

export function run(editor) {
  editor.insertNode(<h1>Foo bar!</h1>);
}
