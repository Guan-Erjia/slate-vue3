/** @jsx jsx  */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block void>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
)
export const test = editor => {
  return Editor.string(editor, [0])
}
export const output = ``
