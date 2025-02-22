/** @jsx jsx */
import { Editor, Transforms, Element } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.moveNodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    to: [1],
  })
}
export const input = (
  <editor>
    <block>
      <block>one</block>
      <block>
        <anchor />
        two
      </block>
      <block>
        three
        <focus />
      </block>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <block>one</block>
    </block>
    <block>
      <anchor />
      two
    </block>
    <block>
      three
      <focus />
    </block>
  </editor>
)
