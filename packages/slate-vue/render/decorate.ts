import { DecoratedRange, Element, NodeEntry } from "slate-vue3/core";
import { DOMEditor } from "slate-vue3/dom";
import { computed, inject, provide, ComputedRef } from "vue";
import { useEditor } from "../hooks/use-editor";
import { DEFAULT_DECORATE_FN } from "../components/utils";

export const SLATE_INNER_RENDER_DECORATE_FN = Symbol(
  "SLATE_INNER_RENDER_DECORATE_FN",
);

export const provideDecorateFn = (
  fn: (entry: NodeEntry) => DecoratedRange[],
) => {
  provide(SLATE_INNER_RENDER_DECORATE_FN, fn);
};

export const injectDecorateFn = (): ((
  entry: NodeEntry,
) => DecoratedRange[]) => {
  const decorate = inject<(entry: NodeEntry) => DecoratedRange[]>(
    SLATE_INNER_RENDER_DECORATE_FN,
  );
  if (decorate === undefined) {
    throw new Error(
      `The \`injectDecorateFn\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return decorate;
};

export const SLATE_INNER_RENDER_DECORATE_RANGE = Symbol(
  "SLATE_INNER_RENDER_DECORATE_RANGE",
);

export const provideElementDR = (element: Element) => {
  const decorate = injectDecorateFn();
  const needDecorate = decorate !== DEFAULT_DECORATE_FN;
  if (!needDecorate) {
    provide(
      SLATE_INNER_RENDER_DECORATE_RANGE,
      computed(() => []),
    );
    return;
  }
  const editor = useEditor();
  const elementDR = computed(() => {
    const elemPath = DOMEditor.findPath(editor, element);
    return decorate([element, elemPath]);
  });
  provide(SLATE_INNER_RENDER_DECORATE_RANGE, elementDR);
};

export const injectInnerElementDR = () => {
  const elementDR = inject<ComputedRef<DecoratedRange[]>>(
    SLATE_INNER_RENDER_DECORATE_RANGE,
  );
  if (elementDR === undefined) {
    throw new Error(
      `The \`injectInnerElementDR\` hook must be used inside the <Element> component's context.`,
    );
  }
  return elementDR;
};
