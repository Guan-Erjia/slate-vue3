import { DOMEditor } from 'slate-dom'
import { inject } from 'vue'
import { SLATE_USE_EDITOR } from '../constants'

/**
 * A React context for sharing the editor object, in a way that re-renders the
 * context whenever changes occur.
 */

/**
 * Get the current editor object from the React context.
 */

export const useEditor = (): DOMEditor => {
  const editor = inject<DOMEditor>(SLATE_USE_EDITOR)
  if (!editor) {
    throw new Error(`The \`useEditor\` hook must be used inside the <Slate> component's context.`)
  }
  return editor
}
