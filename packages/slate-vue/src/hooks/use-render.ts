import { ComputedRef, inject, Ref, RendererNode, watch, type VNode } from "vue";
import {
  SLATE_INNER_CHANGE_EFFECT_INJECT,
  SLATE_INNER_PLACEHOLDER_CONTEXT,
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

export const usePlaceholderContext = () => {
  const PLACEHOLDER_CONTEXT = inject<
    ComputedRef<{
      placeholder: string;
      onPlaceholderResize: (placeholderEl: RendererNode) => void;
    } | null>
  >(SLATE_INNER_PLACEHOLDER_CONTEXT);
  if (PLACEHOLDER_CONTEXT === undefined) {
    throw new Error(
      `The \`usePlaceholderContext\` hook must be used inside the <Slate> component's context.`
    );
  }
  return PLACEHOLDER_CONTEXT;
};

export const useChangeEffect = (fn: () => void) => {
  const CHANGE_EFFECT_INJECT = inject<Ref<number>>(
    SLATE_INNER_CHANGE_EFFECT_INJECT
  );
  if (CHANGE_EFFECT_INJECT === undefined) {
    throw new Error(
      `The \`useChangeEffect\` hook must be used inside the <Slate> component's context.`
    );
  }

  watch(() => CHANGE_EFFECT_INJECT.value, fn);
  return CHANGE_EFFECT_INJECT;
};
