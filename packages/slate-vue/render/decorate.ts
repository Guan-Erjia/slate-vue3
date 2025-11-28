import { DecoratedRange, Element, NodeEntry } from "slate";
import { DOMEditor } from "slate-dom";
import { computed, inject, provide, ComputedRef } from "vue";
import { useEditor } from "../hooks/use-editor";

export const SLATE_INNER_RENDER_DECORATE_FN = Symbol(
  "SLATE_INNER_RENDER_DECORATE_FN",
);

export const provideInnerDecorateFn = (
  fn: (entry: NodeEntry) => DecoratedRange[],
) => {
  provide(SLATE_INNER_RENDER_DECORATE_FN, fn);
};

export const injectInnerDecorateFn = (): ((
  entry: NodeEntry,
) => DecoratedRange[]) => {
  const decorate = inject<(entry: NodeEntry) => DecoratedRange[]>(
    SLATE_INNER_RENDER_DECORATE_FN,
  );
  if (decorate === undefined) {
    throw new Error(
      `The \`injectInnerDecorateFn\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return decorate;
};

export const SLATE_INNER_RENDER_DECORATE_RANGE = Symbol(
  "SLATE_INNER_RENDER_DECORATE_RANGE",
);

export const provideInnerElementDR = (element: Element) => {
  const decorate = injectInnerDecorateFn();
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
