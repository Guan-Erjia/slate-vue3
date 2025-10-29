import { inject, ShallowReactive } from "vue";
import { SLATE_USE_EDITOR } from "../utils/constants";
import type { DOMEditor } from "slate-dom";

/**
 * Get the current editor reactive object from the context.
 */
export const useEditor = (): ShallowReactive<DOMEditor> => {
  const editor = inject<DOMEditor>(SLATE_USE_EDITOR);
  if (editor === undefined) {
    throw new Error(
      `The \`useEditor\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return editor;
};
