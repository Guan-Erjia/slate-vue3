import { SLATE_USE_FOCUSED } from "../utils/constants";
import { inject, type Ref } from "vue";

/**
 * Get the current `focused` state of the editor.
 */
export const useFocused = (): Ref<boolean, boolean> => {
  const isFocus = inject<Ref<boolean, boolean>>(SLATE_USE_FOCUSED);
  if (isFocus === undefined) {
    throw new Error(
      `The \`useFocused\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return isFocus;
};
