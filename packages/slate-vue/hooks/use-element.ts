import { SLATE_USE_ELEMENT } from "../utils/constants";
import { inject } from "vue";
import { Element } from "slate";

/**
 * Get the current element.
 */
export const useElementProps = () => {
  const props = inject<{
    element: Element;
  }>(SLATE_USE_ELEMENT);
  if (props === undefined) {
    throw new Error(
      `The \`useElementProps\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return props;
};

export const useElementPropsIf = () => {
  const props = inject<{
    element: Element;
  }>(SLATE_USE_ELEMENT);
  return props;
};
