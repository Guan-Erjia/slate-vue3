import type { BaseSelection } from "slate";
import { type ComputedRef, inject } from "vue";
import { SLATE_USE_SELECTION } from "../utils/constants";

/**
 * Get the current slate selection.
 * Only triggers a rerender when the selection actually changes
 */
export const useSelection = (): ComputedRef<BaseSelection> => {
  const selection = inject<ComputedRef<BaseSelection>>(SLATE_USE_SELECTION);
  if (selection === undefined) {
    throw new Error(
      `The \`useSelection\` hook must be used inside the <Slate> component's context.`
    );
  }
  return selection;
};
