/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <text a>1</text>
      <text a>2</text>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <text a>12</text>
    </block>
  </editor>
)
