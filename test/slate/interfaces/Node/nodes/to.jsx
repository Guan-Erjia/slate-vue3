/** @jsx jsx  */
import { Node } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      <text key="a" />
      <text key="b" />
      <text key="c" />
      <text key="d" />
    </element>
  </editor>
)
export const test = value => {
  return Array.from(
    Node.nodes(value, {
      from: [0, 1],
      to: [0, 2],
    })
  )
}
export const output = [
  [input, []],
  [
    <element>
      <text key="a" />
      <text key="b" />
      <text key="c" />
      <text key="d" />
    </element>,
    [0],
  ],
  [<text key="b" />, [0, 1]],
  [<text key="c" />, [0, 2]],
]
