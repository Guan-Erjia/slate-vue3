/** @jsx jsx */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <text />
    </block>
  </editor>
)
export const test = editor => {
  const block = editor.children[0]
  return Editor.isEmpty(editor, block)
}
export const output = true
