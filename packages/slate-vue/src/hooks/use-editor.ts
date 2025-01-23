import { inject } from "vue";
import { SLATE_USE_EDITOR } from "../utils/constants";
import type { Editor } from "slate";

/**
 * Get the current editor object from the React context.
 */
export const useEditor = (): Editor => {
  const editor = inject<Editor>(SLATE_USE_EDITOR);
  if (editor === undefined) {
    throw new Error(
      `The \`useEditor\` hook must be used inside the <Slate> component's context.`
    );
  }
  return editor;
};
