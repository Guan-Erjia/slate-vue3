/** @jsx jsx */
import { Editor, Transforms, Element } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.moveNodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    to: [2],
  })
}
export const input = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>
      two
      <focus />
    </block>
    <block>three</block>
  </editor>
)

export const output = (
  <editor>
    <block>three</block>
    <block>
      <anchor />
      one
    </block>
    <block>
      two
      <focus />
    </block>
  </editor>
)
