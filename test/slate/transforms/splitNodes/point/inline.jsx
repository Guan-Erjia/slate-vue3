/** @jsx jsx */
import { Editor, Transforms, Element } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.splitNodes(editor, {
    at: { path: [0, 1, 0], offset: 2 },
    match: n => Element.isElement(n) && Editor.isInline(editor, n),
  })
}
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        <text>word</text>
      </inline>
      <text />
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <text />
      <inline>
        <text>wo</text>
      </inline>
      <text />
      <inline>
        <text>rd</text>
      </inline>
      <text />
    </block>
  </editor>
)
