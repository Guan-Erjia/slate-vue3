/** @jsx jsx  */
import { Node } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <element>
    <text>one</text>
    <text>two</text>
  </element>
)
export const test = value => {
  return Node.string(value, [1])
}
export const output = `onetwo`
