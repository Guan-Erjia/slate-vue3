/** @jsx jsx  */
import { Node } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
)
export const test = value => {
  return Node.get(value, [0])
}
export const output = (
  <element>
    <text />
  </element>
)
