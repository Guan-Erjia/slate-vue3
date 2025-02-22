/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      <text bold>some text</text>
    </element>
  </editor>
)
export const operations = [
  {
    type: 'split_node',
    path: [0, 0],
    position: 5,
    properties: {},
  },
]
export const output = (
  <editor>
    <element>
      <text bold>some </text>
      <text>text</text>
    </element>
  </editor>
)
