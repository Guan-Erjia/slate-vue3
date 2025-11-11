import { Ancestor, Descendant, Editor, Element, Text } from "slate";
import {
  DOMEditor,
  getChunkTreeForNode,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  reconcileChildren,
} from "slate-dom";
import {
  computed,
  defineComponent,
  h,
  provide,
  renderList,
  VNode,
  watch,
} from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkComp } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { SLATE_INNER_STATIC_CHUNK_ROOT } from "../utils/constants";
import { useEditorNodeVersion } from "../hooks/use-render";

/**
 * Children.
 */
export const ChildrenComp = defineComponent({
  name: "slate-children",
  props: ["element"],
  setup(props: { element: Ancestor }) {
    const editor = useEditor();
    const element = props.element;

    const isBlock = computed(
      () =>
        !Editor.isEditor(element) &&
        Element.isElement(element) &&
        !editor.isInline(element),
    );

    const chunkSize = Editor.hasInlines(editor, element)
      ? null
      : editor.getChunkSize(element);

    const cacheTree = chunkSize
      ? getChunkTreeForNode(editor, props.element)
      : null;

    const editorNodeVersion = useEditorNodeVersion();

    if (cacheTree && chunkSize) {
      watch(
        editorNodeVersion,
        () => {
          reconcileChildren(editor, {
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
    }

    provide(SLATE_INNER_STATIC_CHUNK_ROOT, cacheTree);

    return () => {
      if (chunkSize === null || isBlock.value || !cacheTree) {
        return renderList(element.children, (n, i): VNode => {
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
      } else {
        return h(ChunkComp, {
          ancestor: cacheTree,
        });
      }
    };
  },
});
