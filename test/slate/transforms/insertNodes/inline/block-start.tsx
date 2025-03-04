/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = (editor, options = {}) => {
  Transforms.insertNodes(
    editor,
    <inline void>
      <text />
    </inline>,
    options
  )
}
export const input = (
  <editor>
    <block>
      <cursor />
      word
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <text />
      <inline void>
        <cursor />
      </inline>
      word
    </block>
  </editor>
)
