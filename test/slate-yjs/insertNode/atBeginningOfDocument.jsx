/** @jsx jsxYjs */
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <cursor />
      Hello world!
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <h1>
      Foo bar!
      <cursor />
    </h1>
    <unstyled>Hello world!</unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export function run(editor) {
  editor.insertNode(<h1>Foo bar!</h1>);
}
