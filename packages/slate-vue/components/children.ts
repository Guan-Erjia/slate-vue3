import { Ancestor, Descendant, Editor, Element, Text } from "slate";
import {
  DOMEditor,
  getChunkTreeForNode,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  reconcileChildren,
} from "slate-dom";
import { defineComponent, h, provide, renderList, VNode, watch } from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkComp } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { provideElementDR } from "../render/decorate";
import { useEditorNodeVersion } from "../render/version";
import {
  provideIsLastEmptyBlock,
  provideLastElementNodeIndex,
} from "../render/last";
import { provideChunkRoot } from "../render/chunk";

/**
 * Children.
 */
export const ChildrenComp = defineComponent({
  name: "slate-children",
  props: ["element"],
  setup(props: { element: Ancestor }) {
    const editor = useEditor();
    const element = props.element;

    const isBlock =
      !Editor.isEditor(element) &&
      Element.isElement(element) &&
      !editor.isInline(element);

    const chunkSize = Editor.hasInlines(editor, element)
      ? null
      : editor.getChunkSize(element);

    if (isBlock || chunkSize === null) {
      provideElementDR(element);
      provideLastElementNodeIndex(element);
      provideIsLastEmptyBlock(element);

      return () =>
        renderList(element.children, (n, i): VNode => {
          // Update the index and parent of each child.
          // PERF: If chunking is enabled, this is done while traversing the chunk tree
          // instead to eliminate unnecessary weak map operations.
          NODE_TO_INDEX.set(n, i);
          NODE_TO_PARENT.set(n, element);
          const key = DOMEditor.findKey(editor, n);
          return Text.isText(n)
            ? h(TextComp, {
                text: n,
                element: element,
                key: key.id,
              })
            : h(ElementComp, {
                element: n,
                key: key.id,
              });
        });
    }

    const cacheTree = getChunkTreeForNode(editor, props.element);

    const editorNodeVersion = useEditorNodeVersion();

    watch(
      editorNodeVersion,
      () => {
        reconcileChildren(editor, element.children, {
          chunkTree: cacheTree,
          chunkSize: chunkSize,
          onInsert: (n: Descendant, i: number) => {
            NODE_TO_INDEX.set(n, i);
            NODE_TO_PARENT.set(n, element);
          },
          onUpdate: (n: Descendant, i: number) => {
            NODE_TO_INDEX.set(n, i);
            NODE_TO_PARENT.set(n, element);
          },
          onIndexChange: (n: Descendant, i: number) => {
            NODE_TO_INDEX.set(n, i);
          },
        });
      },
      {
        immediate: true,
      },
    );

    provideChunkRoot(cacheTree);

    return () =>
      h(ChunkComp, {
        ancestor: cacheTree,
      });
  },
});
