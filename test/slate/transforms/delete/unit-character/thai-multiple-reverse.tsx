/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.delete(editor, { unit: 'character', distance: 2, reverse: true })
}
export const input = (
  <editor>
    <block>
      พี่
      <cursor />
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      พ
      <cursor />
    </block>
  </editor>
)
