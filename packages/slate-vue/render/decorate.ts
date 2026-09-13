import { DecoratedRange, NodeEntry } from "slate";
import { inject, provide } from "vue";

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
