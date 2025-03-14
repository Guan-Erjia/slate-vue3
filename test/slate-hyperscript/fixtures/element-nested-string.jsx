/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <element>
    <element>word</element>
  </element>
)
export const output = {
  children: [
    {
      children: [
        {
          text: 'word',
        },
      ],
    },
  ],
}
