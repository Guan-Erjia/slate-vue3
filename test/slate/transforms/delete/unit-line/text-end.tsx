/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'
import { cloneDeep } from 'lodash-es'

export const run = editor => {
  Transforms.delete(editor, { unit: 'line' })
}
export const input = (
  <editor>
    <block>
      one two three
      <cursor />
    </block>
  </editor>
)
export const output = cloneDeep(input)
