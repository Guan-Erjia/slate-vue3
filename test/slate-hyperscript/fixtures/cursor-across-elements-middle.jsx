/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <element>
      on
      <anchor />e
    </element>
    <element>
      t<focus />
      wo
    </element>
  </editor>
)
export const output = {
  children: [
    {
      children: [
        {
          text: 'one',
        },
      ],
    },
    {
      children: [
        {
          text: 'two',
        },
      ],
    },
  ],
  selection: {
    anchor: {
      path: [0, 0],
      offset: 2,
    },
    focus: {
      path: [1, 0],
      offset: 1,
    },
  },
}
