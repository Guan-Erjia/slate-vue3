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
      <block>
        word
        <cursor />
      </block>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <block>wordone</block>
      <block>two</block>
      <block>
        three
        <cursor />
      </block>
    </block>
  </editor>
)
