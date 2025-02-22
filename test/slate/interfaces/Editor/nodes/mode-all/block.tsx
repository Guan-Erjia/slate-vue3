/** @jsx jsx */
import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block a>
      <block a>one</block>
    </block>
    <block a>
      <block a>two</block>
    </block>
  </editor>
)
export const test = editor => {
  return Array.from(
    Editor.nodes(editor, { at: [], match: n => n.a, mode: 'all' })
  )
}
export const output = [
  [
    <block a>
      <block a>one</block>
    </block>,
    [0],
  ],
  [<block a>one</block>, [0, 0]],
  [
    <block a>
      <block a>two</block>
    </block>,
    [1],
  ],
  [<block a>two</block>, [1, 0]],
]
