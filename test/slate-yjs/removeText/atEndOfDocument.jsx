/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <anchor />
      Welcome to slate-yjs!
      <focus />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const inputRemoteEditor = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.delete(editor);
}
