/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <fragment>
    <element>word</element>
  </fragment>
)
export const output = [
  {
    children: [
      {
        text: 'word',
      },
    ],
  },
]
