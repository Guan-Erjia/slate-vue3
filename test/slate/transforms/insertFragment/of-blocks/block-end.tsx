/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = (editor, options = {}) => {
  Transforms.insertFragment(
    editor,
    <fragment>
      <block>one</block>
      <block>two</block>
      <block>three</block>
    </fragment>,
    options
  )
}
export const input = (
  <editor>
    <block>
      word
      <cursor />
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>wordone</block>
    <block>two</block>
    <block>
      three
      <cursor />
    </block>
  </editor>
)
