/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block void>
      one
      <cursor />
    </block>
  </editor>
)
export const run = (editor, options = {}) => {
  Transforms.insertNodes(editor, <text>two</text>, {
    at: [0, 1],
    voids: true,
    options,
  })
}
export const output = (
  <editor>
    <block void>
      one
      <cursor />
      two
    </block>
  </editor>
)
