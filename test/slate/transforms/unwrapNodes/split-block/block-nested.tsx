/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.a, split: true })
}
export const input = (
  <editor>
    <block>
      <block a>
        <block>one</block>
        <block>two</block>
        <block>
          <anchor />
          three
        </block>
        <block>
          four
          <focus />
        </block>
        <block>five</block>
        <block>six</block>
      </block>
    </block>
  </editor>
)
export const output = (
  <editor>
    <block>
      <block a>
        <block>one</block>
        <block>two</block>
      </block>
      <block>
        <anchor />
        three
      </block>
      <block>
        four
        <focus />
      </block>
      <block a>
        <block>five</block>
        <block>six</block>
      </block>
    </block>
  </editor>
)
