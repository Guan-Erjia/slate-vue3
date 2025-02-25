/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.liftNodes(editor, { at: [0, 0] })
}
export const input = (
  <editor>
    <block>
      <block>word</block>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>word</block>
  </editor>
)
