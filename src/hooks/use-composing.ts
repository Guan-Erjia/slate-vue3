import { inject, Ref } from "vue";
import { SLATE_STATE_COMPOSING } from "../constants";

export const useComposing = (): Ref<boolean, boolean> => {
  const isComposing = inject<Ref<boolean, boolean>>(SLATE_STATE_COMPOSING);
  if (isComposing === undefined) {
    throw new Error(
      `The \`useFocused\` hook must be used inside the <Slate> component's context.`
    );
  }
  return isComposing;
};
