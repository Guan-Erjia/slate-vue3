/** @jsx jsx */
import { jsx } from '@test-utils'

export const input = (
  <text b>
    <text a>word</text>
  </text>
)
export const output = {
  text: 'word',
  a: true,
  b: true,
}
