import { DecoratedRange, Element, NodeEntry } from "slate-vue3/core";
import { DOMEditor } from "slate-vue3/dom";
import { inject, provide } from "vue";
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

export const getElementDR = (
  element: Element,
  editor: DOMEditor,
  decorate: (entry: NodeEntry) => DecoratedRange[],
) => {
  const needDecorate = decorate !== DEFAULT_DECORATE_FN;
  if (!needDecorate) {
    return [];
  }
  const elemPath = DOMEditor.findPath(editor, element);
  return decorate([element, elemPath]);
};
