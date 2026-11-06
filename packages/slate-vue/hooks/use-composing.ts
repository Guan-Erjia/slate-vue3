import { inject, type Ref } from "vue";
import { SLATE_USE_COMPOSING } from "../utils/constants";
import { ReactiveEditor } from "../utils/reactive-editor";

export const EDITOR_TO_COMPOSING = new WeakMap<ReactiveEditor, boolean>();

/**
 * Get the current `composing` state of the editor.
 */
export const useComposing = (): Ref<boolean, boolean> => {
  const isComposing = inject<Ref<boolean, boolean>>(SLATE_USE_COMPOSING);
  if (isComposing === undefined) {
    throw new Error(
      `The \`useComposing\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return isComposing;
};
