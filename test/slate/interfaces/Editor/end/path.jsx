/** @jsx jsx */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>one</block>
  </editor>
)
export const test = editor => {
  return Editor.end(editor, [0])
}
export const output = { path: [0, 0], offset: 3 }
