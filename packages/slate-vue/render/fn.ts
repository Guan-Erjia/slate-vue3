import { inject, provide } from "vue";
import type { SlateProps } from "../utils/interface";

export const SLATE_INNER_RENDER_PROPS = Symbol("SLATE_INNER_RENDER_PROPS");
export const provideRenderProps = (props: SlateProps) =>
  provide(SLATE_INNER_RENDER_PROPS, props);
export const useRenderProps = () => {
  const RENDER_PROPS = inject<
    Omit<SlateProps, "editor" | "initialValue" | "value">
  >(SLATE_INNER_RENDER_PROPS);
  if (RENDER_PROPS === undefined) {
    throw new Error(
      `The \`useRenderProps\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return RENDER_PROPS;
};
