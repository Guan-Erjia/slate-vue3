import { Editor, Element } from "slate";
import { computed, ComputedRef, inject, provide } from "vue";
import { useEditor } from "../hooks/use-editor";
import { DOMEditor } from "slate-dom";

export const SLATE_INNER_RENDER_LAST_ELEMENT_NODE_INDEX = Symbol(
  "SLATE_INNER_RENDER_LAST_ELEMENT_NODE_INDEX",
);

export const provideLastElementNodeIndex = (element: Element) => {
  const editor = useEditor();
  const isLastText = computed(() => {
    if (Editor.isVoid(editor, element)) {
      return false;
    }
    if (!Element.isElement(element)) {
      return false;
    }
    if (editor.isInline(element)) {
      return false;
    }
    if (!Editor.hasInlines(editor, element)) {
      return false;
    }
    return element.children.length - 1;
  });

  provide(SLATE_INNER_RENDER_LAST_ELEMENT_NODE_INDEX, isLastText);
};

export const injectLastNodeIndex = () => {
  const lastNodeIndex = inject<ComputedRef<number | false>>(
    SLATE_INNER_RENDER_LAST_ELEMENT_NODE_INDEX,
  );

  if (lastNodeIndex === undefined) {
    throw new Error(
      `The \`injectLastNodeIndex\` hook must be used inside the <Element> component's context.`,
    );
  }
  return lastNodeIndex;
};

export const SLATE_INNER_RENDER_IS_LAST_EMPTY_BLOCK = Symbol(
  "SLATE_INNER_RENDER_IS_LAST_EMPTY_BLOCK",
);

export const provideIsLastEmptyBlock = (element: Element) => {
  const editor = useEditor();
  const isLastEmptyBlock = computed(() => {
    return (
      !editor.isInline(element) &&
      Editor.string(editor, DOMEditor.findPath(editor, element)) === ""
    );
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
