/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.move(editor)
}
export const input = (
  <editor>
    <block>
      one <focus />
      two th
      <anchor />
      ree
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      one t<focus />
      wo thr
      <anchor />
      ee
    </block>
  </editor>
)
