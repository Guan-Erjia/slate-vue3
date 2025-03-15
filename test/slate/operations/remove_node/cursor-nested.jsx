/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      <text />
    </element>
    <element>
      <element>
        <cursor />
        <text />
      </element>
    </element>
  </editor>
)
export const operations = [
  {
    type: 'remove_node',
    path: [1, 0, 0],
    node: { text: '' },
  },
]
export const output = (
  <editor>
    <element>
      <text />
    </element>
    <element>
      <element>
        <cursor />
      </element>
    </element>
  </editor>
)
