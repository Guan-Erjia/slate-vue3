/* eslint-disable react/void-dom-elements-no-children */
/** @jsx jsxYjs */
import { Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled id="block1">
      slate-yjs
      <cursor />
      slate-yjs
      <link url="https://slate-yjs.dev">slate-yjs</link>
      <link url="https://slate-yjs.dev">slate-yjs</link>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">slate-yjs</unstyled>
    <unstyled id="block1">
      <cursor />
      slate-yjs
      <link url="https://slate-yjs.dev">slate-yjs</link>
      <link url="https://slate-yjs.dev">slate-yjs</link>
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.splitNodes(editor, { always: true });
}
