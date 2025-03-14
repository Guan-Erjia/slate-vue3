/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      <text>
        <cursor />
      </text>
    </element>
  </editor>
)
export const output = {
  children: [
    {
      children: [
        {
          text: '',
        },
      ],
    },
  ],
  selection: {
    anchor: {
      path: [0, 0],
      offset: 0,
    },
    focus: {
      path: [0, 0],
      offset: 0,
    },
  },
}
