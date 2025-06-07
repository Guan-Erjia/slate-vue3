import { SLATE_USE_ELEMENT, SLATE_USE_FOCUSED } from "../utils/constants";
import { ComputedRef, inject, type Ref } from "vue";
import { Element } from "slate";

/**
 * Get the current element.
 */
export const useElement = (): ComputedRef<Element> => {
  const element = inject<ComputedRef<Element>>(SLATE_USE_ELEMENT);
  if (element === undefined) {
    throw new Error(
      `The \`useElement\` hook must be used inside the <Slate> component's context.`
    );
  }
  return element;
};

export const useElementIf = (): ComputedRef<Element> | undefined => {
  const element = inject<ComputedRef<Element>>(SLATE_USE_ELEMENT);
  return element;
};
