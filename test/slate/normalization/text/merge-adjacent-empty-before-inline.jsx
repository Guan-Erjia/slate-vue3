/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <text>not empty</text>
      <text a />
      <inline>inline</inline>
      <text />
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <text>not empty</text>
      <inline>inline</inline>
      <text />
    </block>
  </editor>
)
