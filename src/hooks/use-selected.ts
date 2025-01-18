import { ComputedRef, inject } from "vue";
import { SLATE_USE_SELECTED } from "../constants";

/**
 * Get the current `selected` state of an element.
 */
export const useSelected = (): ComputedRef<boolean> => {
  const selected = inject<ComputedRef<boolean>>(SLATE_USE_SELECTED);
  if (selected === undefined) {
    throw new Error(
      `The \`useFocused\` hook must be used inside the <Slate> component's context.`
    );
  }
  return selected;
};
