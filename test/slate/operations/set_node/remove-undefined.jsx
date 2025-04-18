/** @jsx jsx */
import { jsx } from '@test-utils'
import { Transforms, Editor } from 'slate'

export const input = (
  <editor>
    <element>
      <text someKey />
    </element>
  </editor>
)

// this is supported for backwards compatibility only; newProperties should omit removed values.
export const operations = [
  {
    type: 'set_node',
    path: [0, 0],
    properties: { someKey: true },
    newProperties: { someKey: undefined },
  },
]

export const output = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
)
