/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <block>one</block>
      <inline>two</inline>
      <block>three</block>
      <inline>four</inline>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <block>one</block>
      <block>three</block>
    </block>
  </editor>
)
