import { inject, type VNode } from "vue";
import {
  SLATE_INNER_RENDER_ELEMENT,
  SLATE_INNER_RENDER_LEAF,
  SLATE_INNER_RENDER_PLACEHOLDER,
} from "../utils/constants";
import type {
  RenderElementProps,
  RenderPlaceholderProps,
  RenderLeafProps,
} from "../components/interface";

export const useRenderElement = () => {
  const ELEMENT_RENDER = inject<(props: RenderElementProps) => VNode>(
    SLATE_INNER_RENDER_ELEMENT
  );
  if (ELEMENT_RENDER === undefined) {
    throw new Error(
      `The \`useRenderElement\` hook must be used inside the <Slate> component's context.`
    );
  }
  return ELEMENT_RENDER;
};

export const useRenderLeaf = () => {
  const LEAF_RENDER = inject<(props: RenderLeafProps) => VNode>(
    SLATE_INNER_RENDER_LEAF
  );
  if (LEAF_RENDER === undefined) {
    throw new Error(
      `The \`useRenderLeaf\` hook must be used inside the <Slate> component's context.`
    );
  }
  return LEAF_RENDER;
};

export const useRenderPlaceholder = () => {
  const PLACEHOLDER_RENDER = inject<(props: RenderPlaceholderProps) => VNode>(
    SLATE_INNER_RENDER_PLACEHOLDER
  );
  if (PLACEHOLDER_RENDER === undefined) {
    throw new Error(
      `The \`useRenderPlaceholder\` hook must be used inside the <Slate> component's context.`
    );
  }
  return PLACEHOLDER_RENDER;
};
