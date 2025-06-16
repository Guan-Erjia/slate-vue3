import { Ancestor, Descendant, Editor, Element, Text } from "slate";
import {
  ChunkTree,
  DOMEditor,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  reconcileChildren,
} from "slate-dom";
import {
  computed,
  defineComponent,
  h,
  provide,
  reactive,
  renderList,
  VNode,
} from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkComp } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { SLATE_INNER_STATIC_CHUNK_ROOT } from "../utils/constants";

/**
 * Children.
 */
export const ChildrenComp = defineComponent({
  name: "slate-children",
  props: ["element"],
  setup(props: { element: Ancestor }) {
    const editor = useEditor();
    // 缓存 isBlock 计算结果，节点属性一般不可能改变
    const element = props.element;
    const isBlock =
      !Editor.isEditor(element) &&
      Element.isElement(element) &&
      !editor.isInline(element);

    const renderElementOrText = () =>
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

    // 不计算 chunkTree 提前返回
    if (isBlock) {
      return renderElementOrText;
    }

    const chunkSize = computed(() =>
      Editor.hasInlines(editor, element) ? null : editor.getChunkSize(element)
    );

    const staticChunkTree: ChunkTree = {
      type: "root",
      movedNodeKeys: new Set(),
      children: reactive([]),
    };

    const chunkTree = computed(() => {
      if (!chunkSize.value) {
        return null;
      }
      reconcileChildren(editor, {
        chunkTree: staticChunkTree,
        children: element.children,
        chunkSize: chunkSize.value,
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
      return staticChunkTree;
    });

    provide(SLATE_INNER_STATIC_CHUNK_ROOT, staticChunkTree);

    return () => {
      if (chunkTree.value === null) {
        return renderElementOrText();
      } else {
        return h(ChunkComp, {
          ancestor: staticChunkTree,
        });
      }
    };
  },
});
