/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>one</block>
  </editor>
)
export const run = (editor, options = {}) => {
  Transforms.insertNodes(editor, <block>two</block>, options)
}
export const output = (
  <editor>
    <block>one</block>
    <block>
      two
      <cursor />
    </block>
  </editor>
)
