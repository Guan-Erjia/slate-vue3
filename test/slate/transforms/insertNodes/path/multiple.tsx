/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
  </editor>
)
export const run = (editor, options = {}) => {
  Transforms.insertNodes(editor, [<block>two</block>, <block>three</block>], {
    at: [0],
    ...options,
  })
}
export const output = (
  <editor>
    <block>two</block>
    <block>three</block>
    <block>
      <cursor />
      one
    </block>
  </editor>
)
