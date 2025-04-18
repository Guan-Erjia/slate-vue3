/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.splitNodes(editor)
}
export const input = (
  <editor>
    <block>
      <block void>
        wo
        <anchor />
        rd
      </block>
      <block void>
        an
        <focus />
        other
      </block>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <text />
    </block>
  </editor>
)
