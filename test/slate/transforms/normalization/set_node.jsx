/** @jsx jsx */
import { Editor, Element, Transforms } from 'slate'
import { jsx } from '@test-utils'
import _ from 'lodash-es'

export const input = (
  <editor>
    <block type="body" attr={{ a: true }}>
      one
    </block>
  </editor>
)

const editor = input
const defaultNormalize = editor.normalizeNode
editor.normalizeNode = entry => {
  const [node, path] = entry
  if (
    Element.isElement(node) &&
    node.type === 'body' &&
    Editor.string(editor, path, { voids: true }) === 'one'
  ) {
    Transforms.setNodes(
      editor,
      { attr: { a: false } },
      { at: path, compare: (p, n) => !_.isEqual(p, n) }
    )
  }

  defaultNormalize(entry)
}

export const run = editor => {
  Editor.normalize(editor, { force: true })
}

export const output = (
  <editor>
    <block type="body" attr={{ a: false }}>
      one
    </block>
  </editor>
)
