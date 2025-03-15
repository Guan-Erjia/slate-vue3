/** @jsx jsx */
import assert from 'assert'
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = (editor) => {
  Transforms.setNodes(editor, { someKey: true }, { at: [0] })
  const [op] = editor.operations
  const roundTrip = JSON.parse(JSON.stringify(op))
  assert.deepStrictEqual(op, roundTrip)
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
    <block someKey>
      <text />
    </block>
  </editor>
)
