/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
    <block>
      <block>two</block>
    </block>
  </editor>
)
export const run = editor => {
  Transforms.removeNodes(editor, { at: [0, 0] })
}
export const output = (
  <editor>
    <block>
      <text />
    </block>
    <block>
      <block>two</block>
    </block>
  </editor>
)
