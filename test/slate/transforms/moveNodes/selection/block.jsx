/** @jsx jsx */
import { Editor, Transforms, Element } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
    <block>two</block>
  </editor>
)
export const run = editor => {
  Transforms.moveNodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    to: [1],
  })
}
export const output = (
  <editor>
    <block>two</block>
    <block>
      <cursor />
      one
    </block>
  </editor>
)
