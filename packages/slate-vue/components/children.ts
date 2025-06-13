import { Ancestor, Editor, Element, Text } from "slate";
import {
  DOMEditor,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  getChunkTreeForNode,
} from "slate-dom";
import { computed, defineComponent, h, provide, renderList, VNode } from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkComp } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { SLATE_INNER_STATIC_CHUNK } from "../utils/constants";

/**
 * Children.
 */
export const ChildrenComp = defineComponent({
  props: ["element"],
  setup(props: { element: Ancestor }) {
    const editor = useEditor();
    const element =
      Editor.isEditor(props.element) &&
      editor.getChunkSize(props.element) !== null
        ? { ...props.element }
        : props.element;

    // 缓存 isBlock 计算结果，节点属性一般不可能改变
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

    const chunkTree = computed(() => {
      if (!chunkSize.value) {
        return null;
      }
      return getChunkTreeForNode(editor, element, {
        reconcile: {
          chunkSize: editor.getChunkSize(element) as number,
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

    provide(SLATE_INNER_STATIC_CHUNK, chunkTree?.value || null);

    return () => {
      if (chunkSize.value === null) {
        return renderElementOrText();
      } else if (chunkTree) {
        return h(ChunkComp, {
          ancestor: chunkTree.value,
        });
      }
    };
  },
});
