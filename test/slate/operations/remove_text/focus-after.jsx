/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      <anchor />
      wor
      <focus />d
    </element>
  </editor>
)
export const operations = [
  {
    type: 'remove_text',
    path: [0, 0],
    offset: 1,
    text: 'or',
  },
]
export const output = (
  <editor>
    <element>
      <anchor />w<focus />d
    </element>
  </editor>
)
