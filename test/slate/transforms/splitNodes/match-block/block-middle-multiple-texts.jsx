/** @jsx jsx */
import { Editor, Transforms, Element } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.splitNodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  })
}
export const input = (
  <editor>
    <block>
      <text>
        one
        <cursor />
      </text>
      <text>two</text>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      one
      <cursor />
    </block>
    <block>two</block>
  </editor>
)
