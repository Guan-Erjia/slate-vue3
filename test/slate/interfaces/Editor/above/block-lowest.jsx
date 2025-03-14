/** @jsx jsx */

import { Editor, Element } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <block>one </block>
    </block>
  </editor>
)

export const test = editor => {
  return Editor.above(editor, {
    at: [0, 0, 0],
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  })
}

export const output = [<block>one </block>, [0, 0]]
