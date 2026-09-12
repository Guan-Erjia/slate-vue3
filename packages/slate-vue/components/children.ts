import { Ancestor, Descendant, Editor, Node } from "slate-vue3/core";
import {
  DOMEditor,
  getChunkTreeForNode,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  reconcileChildren,
} from "slate-vue3/dom";
import { defineComponent, h, renderList, VNode } from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkCompFc } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { getElementDR, injectDecorateFn } from "../render/decorate";
import { provideIsLastEmptyBlock } from "../render/last";
import { provideChunkRoot, useRenderChunk } from "../render/chunk";

/**
 * Children.
 */
export const ChildrenComp = defineComponent({
  name: "slate-children",
  props: ["element"],
  setup(props: { element: Ancestor }) {
    const editor = useEditor();

    const isBlock =
      Node.isElement(props.element) && !editor.isInline(props.element);

    const chunkSize = Editor.hasInlines(editor, props.element)
      ? null
      : editor.getChunkSize(props.element);

    if (isBlock || chunkSize === null) {
      provideIsLastEmptyBlock(props.element);
      const decorate = injectDecorateFn();

      return () => {
        const elementDR = getElementDR(props.element, editor, decorate);
        return renderList(props.element.children, (n, i): VNode => {
          // Update the index and parent of each child.
          // PERF: If chunking is enabled, this is done while traversing the chunk tree
          // instead to eliminate unnecessary weak map operations.
          NODE_TO_INDEX.set(n, i);
          NODE_TO_PARENT.set(n, props.element);
          const key = DOMEditor.findKey(editor, n);
          return Node.isText(n)
            ? h(TextComp, {
                text: n,
                key: key.id,
                elementDR,
                isLast: i === props.element.children.length - 1,
              })
            : h(ElementComp, {
                element: n,
                key: key.id,
              });
        });
      };
    }

    const cacheTree = getChunkTreeForNode(editor, props.element);

    provideChunkRoot(cacheTree);
    const renderChunk = useRenderChunk();

    return () => {
      // console.time("Reconcile children chunks");
      reconcileChildren(editor, props.element.children, {
        chunkTree: cacheTree,
        chunkSize: chunkSize,
        onInsert: (n: Descendant, i: number) => {
          NODE_TO_INDEX.set(n, i);
          NODE_TO_PARENT.set(n, props.element);
        },
        onUpdate: (n: Descendant, i: number) => {
          NODE_TO_INDEX.set(n, i);
          NODE_TO_PARENT.set(n, props.element);
        },
        onIndexChange: (n: Descendant, i: number) => {
          NODE_TO_INDEX.set(n, i);
        },
      });
      // console.timeEnd("Reconcile children chunks");
      return ChunkCompFc(cacheTree, renderChunk, true);
    };
  },
});
