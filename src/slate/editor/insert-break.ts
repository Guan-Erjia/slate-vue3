import { Transforms } from '../interfaces/transforms'
import { type EditorInterface } from '../interfaces/editor'

export const insertBreak: EditorInterface['insertBreak'] = editor => {
  Transforms.splitNodes(editor, { always: true })
}
