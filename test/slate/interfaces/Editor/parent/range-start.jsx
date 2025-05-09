/** @jsx jsx */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
)
export const test = editor => {
  return Editor.parent(
    editor,
    {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
    { edge: 'start' }
  )
}
export const output = [<block>one</block>, [0]]
