import { SLATE_USE_ELEMENT } from "../utils/constants";
import { ComputedRef, inject } from "vue";
import { Element } from "slate";

/**
 * Get the current element.
 */
export const useElement = (): ComputedRef<Element> => {
  const element = inject<ComputedRef<Element>>(SLATE_USE_ELEMENT);
  if (element === undefined) {
    throw new Error(
      `The \`useElement\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return element;
};

export const useElementIf = (): ComputedRef<Element> | undefined => {
  const element = inject<ComputedRef<Element>>(SLATE_USE_ELEMENT);
  return element;
};
