import type { DecoratedRange, NodeEntry } from "slate";
import { inject } from "vue";
import { SLATE_INNER_RENDER_DECORATE } from "../utils/constants";

/**
 * Get the current `decorate` prop of the editable.
 */
export const useDecorate = (): {
  decorate: (entry: NodeEntry) => DecoratedRange[];
  addEventListener: (callback: () => void) => () => void;
} => {
  const decorate = inject<{
    decorate: (entry: NodeEntry) => DecoratedRange[];
    addEventListener: (callback: () => void) => () => void;
  }>(SLATE_INNER_RENDER_DECORATE);
  if (decorate === undefined) {
    throw new Error(
      `The \`useDecorate\` hook must be used inside the <Slate> component's context.`
    );
  }
  return decorate;
};
