/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      on
      <anchor />e
    </block>
    <block>
      t<focus />
      wo
    </block>
    <block>three</block>
  </editor>
)
export const run = editor => {
  Transforms.removeNodes(editor)
}
export const output = (
  <editor>
    <block>
      <cursor />
      three
    </block>
  </editor>
)
