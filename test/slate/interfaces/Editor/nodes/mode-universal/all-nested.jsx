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
    Editor.nodes(editor, {
      at: [],
      match: n => n.a === true,
      mode: 'lowest',
      universal: true,
    })
  )
}
export const output = [
  [<block a>one</block>, [0, 0]],
  [<block a>two</block>, [1, 0]],
]
