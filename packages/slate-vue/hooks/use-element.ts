import { SLATE_USE_ELEMENT } from "../utils/constants";
import { inject } from "vue";
import { Element } from "slate-vue3/core";

/**
 * Get the current element.
 */
export const useElement = () => {
  const element = inject<Element>(SLATE_USE_ELEMENT);
  if (element === undefined) {
    throw new Error(
      `The \`useElement\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return element;
};

export const useElementIf = () => {
  const element = inject<Element>(SLATE_USE_ELEMENT);
  return element;
};
