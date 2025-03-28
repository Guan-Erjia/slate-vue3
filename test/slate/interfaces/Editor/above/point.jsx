/** @jsx jsx */

import { Editor } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
  </editor>
)

export const test = editor => {
  return Editor.above(editor, { at: { path: [0, 0, 0], offset: 1 } })
}

export const output = [<block>one</block>, [0, 0]]
