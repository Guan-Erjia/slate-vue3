/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.delete(editor)
}
export const input = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>two</block>
    <block>
      <focus />
      three
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <cursor />
    </block>
    <block>three</block>
  </editor>
)
