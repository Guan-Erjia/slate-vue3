import { BaseSelection, } from 'slate'
import { ComputedRef, inject } from 'vue';
import { SLATE_STATE_SELECTION } from '../constants';

/**
 * Get the current slate selection.
 * Only triggers a rerender when the selection actually changes
 */
export const useSlateSelection = (): ComputedRef<BaseSelection> => {
  const selection = inject<ComputedRef<BaseSelection>>(SLATE_STATE_SELECTION);
  if (selection === undefined) {
    throw new Error(
      `The \`useSlateSelection\` hook must be used inside the <Slate> component's context.`
    );
  }
  return selection
}

