/** @jsx jsx */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
  </editor>
)
export const test = editor => {
  const { anchor } = editor.selection
  return Editor.isEnd(editor, anchor, [0])
}
export const output = false
