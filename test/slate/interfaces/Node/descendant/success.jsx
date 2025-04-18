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
  return Node.descendant(value, [0])
}
export const output = cloneDeep(input.children[0])
