import { Transforms } from '../interfaces/transforms'
import { type EditorInterface } from '../interfaces/editor'

export const insertNode: EditorInterface['insertNode'] = (
  editor,
  node,
  options
) => {
  Transforms.insertNodes(editor, node, options)
}
