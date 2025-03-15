/** @jsx jsx */
import { Transforms, Operation } from 'slate'
import { jsx } from '@test-utils'

export const run = (editor) => {
  Transforms.setNodes(editor, { key: true }, { at: [0] })
  const [op] = editor.operations
  const roundTrip = JSON.parse(JSON.stringify(op))
  const inverted = Operation.inverse(roundTrip)
  editor.apply(inverted)
}
export const input = (
  <editor>
    <block>
      <text />
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
