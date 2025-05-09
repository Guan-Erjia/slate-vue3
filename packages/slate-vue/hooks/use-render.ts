import { ComputedRef, inject, Ref, watch, type VNode } from "vue";
import {
  SLATE_INNER_CHANGE_EFFECT_INJECT,
  SLATE_INNER_RENDER_ELEMENT,
  SLATE_INNER_RENDER_LEAF,
  SLATE_INNER_RENDER_PLACEHOLDER,
  SLATE_INNER_MARK_PLACEHOLDER,
  SLATE_INNER_RENDER_TEXT,
} from "../utils/constants";
import type {
  RenderElementProps,
  RenderPlaceholderProps,
  RenderLeafProps,
  RenderTextProps,
} from "../utils/interface";
import { BasePoint } from "slate";

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

export const useRenderText = () => {
  const TEXT_RENDER = inject<(props: RenderTextProps) => VNode>(
    SLATE_INNER_RENDER_TEXT
  );
  if (TEXT_RENDER === undefined) {
    throw new Error(
      `The \`useRenderText\` hook must be used inside the <Slate> component's context.`
    );
  }
  return TEXT_RENDER;
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

export const useMarkPlaceholder = () => {
  const MARK_PLACEHOLDER_INJECT = inject<
    ComputedRef<{
      anchor: BasePoint;
      focus: BasePoint;
    } | null>
  >(SLATE_INNER_MARK_PLACEHOLDER);
  if (MARK_PLACEHOLDER_INJECT === undefined) {
    throw new Error(
      `The \`useChangeEffect\` hook must be used inside the <Slate> component's context.`
    );
  }

  return MARK_PLACEHOLDER_INJECT;
};
