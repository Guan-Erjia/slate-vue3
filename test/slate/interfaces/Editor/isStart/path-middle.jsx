/** @jsx jsx */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      on
      <cursor />e
    </block>
  </editor>
)
export const test = editor => {
  const { anchor } = editor.selection
  return Editor.isStart(editor, anchor, [0])
}
export const output = false
