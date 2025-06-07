import { Editor, Element } from "slate";
import { ElementComp } from "./element";
import { TextComp } from "./text";
import { DOMEditor, getChunkTreeForNode, NODE_TO_INDEX, NODE_TO_PARENT } from "slate-dom";
import { computed, Fragment, h, VNode } from "vue";
import { ChunkTree } from "./chunk";

export const ChildrenFC = (element: Element, editor: DOMEditor) => {
  const isEditor = Editor.isEditor(element);
  const isBlock =
    !isEditor && Element.isElement(element) && !editor.isInline(element);
  const isLeafBlock = isBlock && Editor.hasInlines(editor, element);
  const chunkSize = isLeafBlock ? null : editor.getChunkSize(element);
  const chunking = !!chunkSize;

  const chunkTree = computed(() => {
    return getChunkTreeForNode(editor, element, {
      reconcile: {
        chunkSize: chunkSize || 0,
        rerenderChildren: [],
        onInsert: (n, i) => {
          NODE_TO_INDEX.set(n, i);
          NODE_TO_PARENT.set(n, element);
        },
        onUpdate: (n, i) => {
          NODE_TO_INDEX.set(n, i);
          NODE_TO_PARENT.set(n, element);
        },
        onIndexChange: (n, i) => {
          NODE_TO_INDEX.set(n, i);
        },
      },
    });
  });

  return chunking
    ? h(ChunkTree, {
        root: chunkTree,
      })
    : h(
        Fragment,
        element.children.map((child, i): VNode => {
          // 这些逻辑不会触发多余渲染
          const key = DOMEditor.findKey(editor, child);
          // 组件直接传入索引将不会动态更新，必须通过 NODE_TO_INDEX 手动获取索引
          NODE_TO_INDEX.set(child, i);
          NODE_TO_PARENT.set(child, element);

          return Element.isElement(child)
            ? h(ElementComp, { element: child, key: key.id })
            : h(TextComp, { text: child, element, key: key.id });
        })
      );
};
