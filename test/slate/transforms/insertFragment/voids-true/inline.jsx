/** @jsx jsx */
import { Transforms } from 'slate'
import { jsx } from '@test-utils'

export const run = (editor, options = {}) => {
  Transforms.insertFragment(editor, <fragment>fragment</fragment>, {
    voids: true,
    ...options,
  })
}
export const input = (
  <editor>
    <block>
      <text />
      <inline void>
        wo
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
)
// TODO: argument to made that fragment should go into the inline
export const output = (
  <editor>
    <block>
      <text />
      <inline void>wo</inline>
      fragment
      <cursor />
      <inline void>rd</inline>
      <text />
    </block>
  </editor>
)
