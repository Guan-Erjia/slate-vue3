/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <text>one</text>
      <block>two</block>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <text>onetwo</text>
    </block>
  </editor>
)
