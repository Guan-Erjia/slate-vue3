/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      one
      <inline void>
        two
        <cursor />
      </inline>
      three
    </block>
  </editor>
)
export const run = (editor, options = {}) => {
  Transforms.insertNodes(editor, <text>four</text>, {
    at: [0, 1, 1],
    voids: true,
    options,
  })
}
export const output = (
  <editor>
    <block>
      one
      <inline void>
        two
        <cursor />
        four
      </inline>
      three
    </block>
  </editor>
)
