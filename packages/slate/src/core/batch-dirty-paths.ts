// perf

import { Editor } from '../interfaces/editor'
import { toRawWeakMap as WeakMap } from 'un-proxy-weakmap'

const BATCHING_DIRTY_PATHS: WeakMap<Editor, boolean> = new WeakMap()

export const isBatchingDirtyPaths = (editor: Editor) => {
  return BATCHING_DIRTY_PATHS.get(editor) || false
}

export const batchDirtyPaths = (
  editor: Editor,
  fn: () => void,
  update: () => void
) => {
  const value = BATCHING_DIRTY_PATHS.get(editor) || false
  BATCHING_DIRTY_PATHS.set(editor, true)
  try {
    fn()
    update()
  } finally {
    BATCHING_DIRTY_PATHS.set(editor, value)
  }
}
