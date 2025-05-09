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
  return Editor.point(
    editor,
    {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 2 },
    },
    { edge: 'start' }
  )
}
export const output = { path: [0, 0], offset: 1 }
