import { createContext, } from 'react'
import { Editor } from 'slate'
import { DOMEditor } from '../plugin/react-editor'
import { inject } from 'vue'

/**
 * A React context for sharing the editor object.
 */

export const EditorContext = createContext<DOMEditor | null>(null)

/**
 * Get the current editor object from the React context.
 */

export const useSlateStatic = (): Editor => {
  const editor = inject("editorRef") as Editor;


  if (!editor) {
    throw new Error(
      `The \`useSlateStatic\` hook must be used inside the <Slate> component's context.`
    )
  }

  return editor
}
