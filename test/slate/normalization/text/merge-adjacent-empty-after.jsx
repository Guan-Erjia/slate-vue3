/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <text />
    </block>
    <block>
      <cursor />
      <text />
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <text />
    </block>
    <block>
      <cursor />
    </block>
  </editor>
)
