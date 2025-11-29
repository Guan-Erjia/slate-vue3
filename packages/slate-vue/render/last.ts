import { Element, Node } from "slate";
import { computed, ComputedRef, inject, provide } from "vue";
import { useEditor } from "../hooks/use-editor";
export const SLATE_INNER_RENDER_IS_LAST_EMPTY_BLOCK = Symbol(
  "SLATE_INNER_RENDER_IS_LAST_EMPTY_BLOCK",
);

export const provideIsLastEmptyBlock = (element: Element) => {
  const editor = useEditor();
  const isLastEmptyBlock = computed(() => {
    return !editor.isInline(element) && Node.string(element) === "";
  });
  provide(SLATE_INNER_RENDER_IS_LAST_EMPTY_BLOCK, isLastEmptyBlock);
};

export const injectIsLastEmptyBlock = () => {
  const isLastEmptyBlock = inject<ComputedRef<number | false>>(
    SLATE_INNER_RENDER_IS_LAST_EMPTY_BLOCK,
  );

  if (isLastEmptyBlock === undefined) {
    throw new Error(
      `The \`injectIsLastEmptyBlock\` hook must be used inside the <Element> component's context.`,
    );
  }
  return isLastEmptyBlock;
};
