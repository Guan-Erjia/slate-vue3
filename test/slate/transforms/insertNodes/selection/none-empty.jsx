/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const input = <editor />
export const run = (editor, options = {}) => {
  Transforms.insertNodes(editor, <block>one</block>, options)
}
export const output = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
)
