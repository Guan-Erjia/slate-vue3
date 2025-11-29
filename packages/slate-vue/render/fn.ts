import { inject, provide, type VNode } from "vue";

import type {
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  RenderChunkProps,
} from "../utils/interface";

export const SLATE_INNER_RENDER_ELEMENT = Symbol("SLATE_INNER_RENDER_ELEMENT");
export const provideRenderElement = (
  fn: (props: RenderElementProps) => VNode,
) => provide(SLATE_INNER_RENDER_ELEMENT, fn);
export const useRenderElement = () => {
  const ELEMENT_RENDER = inject<(props: RenderElementProps) => VNode>(
    SLATE_INNER_RENDER_ELEMENT,
  );
  if (ELEMENT_RENDER === undefined) {
    throw new Error(
      `The \`useRenderElement\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return ELEMENT_RENDER;
};

export const SLATE_INNER_RENDER_LEAF = Symbol("SLATE_INNER_RENDER_LEAF");
export const provideRenderLeaf = (fn: (props: RenderLeafProps) => VNode) =>
  provide(SLATE_INNER_RENDER_LEAF, fn);
export const useRenderLeaf = () => {
  const LEAF_RENDER = inject<(props: RenderLeafProps) => VNode>(
    SLATE_INNER_RENDER_LEAF,
  );
  if (LEAF_RENDER === undefined) {
    throw new Error(
      `The \`useRenderLeaf\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return LEAF_RENDER;
};

export const SLATE_INNER_RENDER_TEXT = Symbol("SLATE_INNER_RENDER_TEXT");
export const provideRenderText = (fn: (props: RenderTextProps) => VNode) =>
  provide(SLATE_INNER_RENDER_TEXT, fn);
export const useRenderText = () => {
  const TEXT_RENDER = inject<(props: RenderTextProps) => VNode>(
    SLATE_INNER_RENDER_TEXT,
  );
  if (TEXT_RENDER === undefined) {
    throw new Error(
      `The \`useRenderText\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return TEXT_RENDER;
};
