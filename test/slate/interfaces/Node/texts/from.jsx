/** @jsx jsx  */
import { Node } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      <text key="a" />
      <text key="b" />
    </element>
  </editor>
)
export const test = value => {
  return Array.from(Node.texts(value, { from: [0, 1] }))
}
export const output = [[<text key="b" />, [0, 1]]]
