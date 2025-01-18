import { SLATE_STATE_READ_ONLY } from "../constants";
import { inject, Ref } from "vue";

/**
 * Get the current `readOnly` state of the editor.
 */
export const useReadOnly = (): Ref<boolean, boolean> => {
  const isReadOnly = inject<Ref<boolean, boolean>>(SLATE_STATE_READ_ONLY);
  if (isReadOnly === undefined) {
    throw new Error(
      `The \`useFocused\` hook must be used inside the <Slate> component's context.`
    );
  }
  return isReadOnly;
};
