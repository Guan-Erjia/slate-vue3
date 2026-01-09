import { Ancestor, Descendant, Editor, Node } from "slate";
import {
  DOMEditor,
  getChunkTreeForNode,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  reconcileChildren,
} from "slate-dom";
import { defineComponent, h, renderList, VNode, watch } from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkComp } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { provideElementDR } from "../render/decorate";
import { useEditorNodeVersion } from "../render/version";
import { provideIsLastEmptyBlock } from "../render/last";
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

    const isBlock = Node.isElement(element) && !editor.isInline(element);

    const chunkSize = Editor.hasInlines(editor, element)
      ? null
      : editor.getChunkSize(element);

    if (isBlock || chunkSize === null) {
      provideElementDR(element);
      provideIsLastEmptyBlock(element);

      return () =>
        renderList(element.children, (n, i): VNode => {
          // Update the index and parent of each child.
          // PERF: If chunking is enabled, this is done while traversing the chunk tree
          // instead to eliminate unnecessary weak map operations.
          NODE_TO_INDEX.set(n, i);
          NODE_TO_PARENT.set(n, element);
          const key = DOMEditor.findKey(editor, n);
          return Node.isText(n)
            ? h(TextComp, {
                text: n,
                key: key.id,
                isLast: i === element.children.length - 1,
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
