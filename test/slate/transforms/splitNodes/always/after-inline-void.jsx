/** @jsx jsx */
import { Editor, Transforms, Element } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.splitNodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    always: true,
  })
}
export const input = (
  <editor>
    <block>
      one
      <inline void>
        <text />
      </inline>
      <cursor />
      two
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      one
      <inline void>
        <text />
      </inline>
      <text />
    </block>
    <block>
      <cursor />
      two
    </block>
  </editor>
)
