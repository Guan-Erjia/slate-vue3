import { BasePoint } from "slate";
import { ComputedRef, inject, provide, VNode } from "vue";
import { RenderPlaceholderProps } from "../utils/interface";

export const SLATE_INNER_PLACEHOLDER = Symbol("SLATE_INNER_PLACEHOLDER");
export const providePlaceholder = (placeholder: ComputedRef<string>) => {
  provide(SLATE_INNER_PLACEHOLDER, placeholder);
};
export const usePlaceholder = () => {
  const PLACEHOLDER_INJECT = inject<ComputedRef<string>>(
    SLATE_INNER_PLACEHOLDER,
  );
  if (PLACEHOLDER_INJECT === undefined) {
    throw new Error(
      `The \`usePlaceholder\` hook must be used inside the <Slate> component's context.`,
    );
  }

  return PLACEHOLDER_INJECT;
};

type MarkPlaceholder = ComputedRef<{
  anchor: BasePoint;
  focus: BasePoint;
} | null>;
export const SLATE_INNER_MARK_PLACEHOLDER = Symbol(
  "SLATE_INNER_MARK_PLACEHOLDER",
);
export const provideMarkPlaceholder = (markPlaceholder: MarkPlaceholder) => {
  provide(SLATE_INNER_MARK_PLACEHOLDER, markPlaceholder);
};
export const useMarkPlaceholder = () => {
  const MARK_PLACEHOLDER_INJECT = inject<MarkPlaceholder>(
    SLATE_INNER_MARK_PLACEHOLDER,
  );
  if (MARK_PLACEHOLDER_INJECT === undefined) {
    throw new Error(
      `The \`useMarkPlaceholder\` hook must be used inside the <Slate> component's context.`,
    );
  }

  return MARK_PLACEHOLDER_INJECT;
};

export const SLATE_INNER_PLACEHOLDER_SHOW = Symbol(
  "SLATE_INNER_PLACEHOLDER_SHOW",
);
export const providePlaceholderShow = (show: ComputedRef<boolean>) => {
  provide(SLATE_INNER_PLACEHOLDER_SHOW, show);
};
export const usePlaceholderShow = () => {
  const PLACEHOLDER_SHOW_INJECT = inject<ComputedRef<boolean>>(
    SLATE_INNER_PLACEHOLDER_SHOW,
  );
  if (PLACEHOLDER_SHOW_INJECT === undefined) {
    throw new Error(
      `The \`usePlaceholderShow\` hook must be used inside the <Slate> component's context.`,
    );
  }

  return PLACEHOLDER_SHOW_INJECT;
};

export const SLATE_INNER_PLACEHOLDER_RESIZE = Symbol(
  "SLATE_INNER_PLACEHOLDER_RESIZE",
);
export const providePlaceholderResize = (fn: (height?: number) => void) => {
  provide(SLATE_INNER_PLACEHOLDER_RESIZE, fn);
};
export const usePlaceholderResize = () => {
  const PLACEHOLDER_RESIZE_INJECT = inject<(height?: number) => void>(
    SLATE_INNER_PLACEHOLDER_RESIZE,
  );
  if (PLACEHOLDER_RESIZE_INJECT === undefined) {
    throw new Error(
      `The \`usePlaceholderResize\` hook must be used inside the <Slate> component's context.`,
    );
  }

  return PLACEHOLDER_RESIZE_INJECT;
};

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
