/** @jsx jsxYjs */
import { Editor, Transforms } from 'slate';
import { jsxYjs } from '@test-utils';

export const input = (
  <editor>
    <unstyled>
      <note-link noteId="note1">
        Meeting notes
        <cursor />
      </note-link>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <note-link noteId="note2">
        Meeting notes
        <cursor />
      </note-link>
    </unstyled>
  </editor>
);

export function run(editor) {
  Transforms.setNodes(
    editor,
    { noteId: 'note2' },
    {
      match: (node) => Editor.isInline(editor, node),
    }
  );
}
