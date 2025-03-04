/** @jsx jsx */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <anchor />
      This is a first paragraph
    </block>
    <block>This is the second paragraph</block>
    <block void>
      This is the third paragraph
      {/* unhang should move focus to here */}
    </block>
    <block>
      <focus />
    </block>
  </editor>
)

export const test = editor => {
  return Editor.unhangRange(editor, editor.selection, { voids: true })
}

export const output = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [2, 0], offset: 27 },
}
