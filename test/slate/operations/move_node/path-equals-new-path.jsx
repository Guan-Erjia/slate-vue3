/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>1</element>
    <element>2</element>
  </editor>
)
export const operations = [
  {
    type: 'move_node',
    path: [0],
    newPath: [0],
  },
]
export const output = (
  <editor>
    <element>1</element>
    <element>2</element>
  </editor>
)
