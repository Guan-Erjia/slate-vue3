/** @jsx jsx */
import { Editor, Element } from 'slate'
import { jsx } from '@test-utils'

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
)
export const test = editor => {
  const inline = editor.children[0].children[1]
  return Element.isElement(inline) && Editor.isBlock(editor, inline)
}
export const output = false
