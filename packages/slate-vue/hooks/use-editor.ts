import { inject, Reactive, toRaw } from "vue";
import { SLATE_USE_EDITOR } from "../utils/constants";
import type { DOMEditor } from "slate-dom";

/**
 * Get the current editor reactive object from the context.
 */
export const useEditor = (): Reactive<DOMEditor> => {
  const editor = inject<DOMEditor>(SLATE_USE_EDITOR);
  if (editor === undefined) {
    throw new Error(
      `The \`useEditor\` hook must be used inside the <Slate> component's context.`
    );
  }
  return editor;
};

/**
 * Get the current editor raw object from the context
 * it won't trigger rerender when children and selection change
 */
export const useEditorStatic = (): DOMEditor => {
  const editor = inject<DOMEditor>(SLATE_USE_EDITOR);
  if (editor === undefined) {
    throw new Error(
      `The \`useEditor\` hook must be used inside the <Slate> component's context.`
    );
  }
  return toRaw(editor);
};
