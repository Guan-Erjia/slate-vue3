/** @jsx jsx  */
import { Node } from 'slate'
import { jsx } from '@test-utils'
import { cloneDeep } from 'lodash-es'

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
)
export const test = value => {
  return Node.getIf(value, [])
}
export const skip = true // TODO: see https://github.com/ianstormtaylor/slate/pull/4188
export const output = cloneDeep(input)
