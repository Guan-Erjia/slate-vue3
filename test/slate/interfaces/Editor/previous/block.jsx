/** @jsx jsx */
import { Editor, Element } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
)
export const test = editor => {
  return Editor.previous(editor, {
    at: [1],
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  })
}
export const output = [<block>one</block>, [0]]
