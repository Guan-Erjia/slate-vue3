/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      Welcome
      <cursor />
      to slate-yjs!
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>Welcome</unstyled>
    <h1>
      Foo bar!
      <cursor />
    </h1>
    <unstyled>to slate-yjs!</unstyled>
  </editor>
);

export function run(editor) {
  editor.insertNode(<h1>Foo bar!</h1>);
}
