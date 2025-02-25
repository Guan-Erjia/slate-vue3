/** @jsx jsx */
import { Transforms, Text } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.unsetNodes(editor, 'someKey', { match: Text.isText })
}
export const input = (
  <editor>
    <block>
      <text someKey>
        <cursor />
        word
      </text>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <cursor />
      word
    </block>
  </editor>
)
