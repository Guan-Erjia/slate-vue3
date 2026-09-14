import { inject, provide, VNode } from "vue";
import { RenderPlaceholderProps } from "../utils/interface";

export const SLATE_INNER_RENDER_PLACEHOLDER = Symbol(
  "SLATE_INNER_RENDER_PLACEHOLDER",
);
export const provideRenderPlaceholder = (
  fn: (props: RenderPlaceholderProps) => VNode,
) => provide(SLATE_INNER_RENDER_PLACEHOLDER, fn);
export const useRenderPlaceholder = () => {
  const PLACEHOLDER_RENDER = inject<(props: RenderPlaceholderProps) => VNode>(
    SLATE_INNER_RENDER_PLACEHOLDER,
  );
  if (PLACEHOLDER_RENDER === undefined) {
    throw new Error(
      `The \`useRenderPlaceholder\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return PLACEHOLDER_RENDER;
};
