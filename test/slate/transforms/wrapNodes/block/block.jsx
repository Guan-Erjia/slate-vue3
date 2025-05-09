/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.wrapNodes(editor, <block a />)
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
    <block a>
      <block>
        <cursor />
        word
      </block>
    </block>
  </editor>
)
