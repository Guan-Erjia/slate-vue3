/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <anchor />
      Hello world!
      <focus />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const inputRemoteEditor = (
  <editor>
    <unstyled>
      Hello world!
      <cursor />
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.delete(editor);
}
