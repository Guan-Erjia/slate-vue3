import { Ancestor, DecoratedRange, Editor, Node, Element } from "slate";
import {
  DOMEditor,
  isElementDecorationsEqual,
  Key,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  splitDecorationsByChild,
} from "slate-vue3/dom";
import { defineComponent, h, renderList, VNode } from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkTreeComp } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { provideIsLastEmptyBlock } from "../render/last";
import { getChunkTreeForNode } from "../chunking";
import { useRenderChunk } from "../render/chunk";

/**
 * Children.
 */
export const ChildrenComp = defineComponent({
  name: "slate-children",
  props: ["element", "decorations"],
  setup(props: { element: Ancestor; decorations: DecoratedRange[] }) {
    const editor = useEditor();
    const renderChunk = useRenderChunk();

    const isBlock =
      Node.isElement(props.element) && !editor.isInline(props.element);

    const chunkSize = Editor.hasInlines(editor, props.element)
      ? null
      : editor.getChunkSize(props.element);

    if (isBlock || chunkSize === null) {
      provideIsLastEmptyBlock(props.element);
    }

    let _mutableDecorationsByChild: DecoratedRange[][] = [];
    return () => {
      const renderElementComponent = (
        n: Element,
        i: number,
        cachedKey?: Key,
      ): VNode => {
        const key = cachedKey ?? DOMEditor.findKey(editor, n);
        return h(ElementComp, {
          decorations: _mutableDecorationsByChild[i],
          element: n,
          key: key.id,
        });
      };
      const decorationsByChild = splitDecorationsByChild(
        editor,
        props.element,
        props.decorations,
      );

      const childrenToRedecorate: number[] = [];

      const mutableDecorationsByChild: DecoratedRange[][] = Array.from({
        length: decorationsByChild.length,
      });

      for (let i = 0; i < decorationsByChild.length; i++) {
        const nextDecorations = decorationsByChild[i];
        const previousDecorations = _mutableDecorationsByChild[i];
        if (isElementDecorationsEqual(previousDecorations, nextDecorations)) {
          mutableDecorationsByChild[i] = previousDecorations;
        } else {
          mutableDecorationsByChild[i] = nextDecorations;
          childrenToRedecorate.push(i);
        }
      }

      _mutableDecorationsByChild = mutableDecorationsByChild;

      if (isBlock || chunkSize === null) {
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
                decorations: mutableDecorationsByChild[i],
                isLast: i === props.element.children.length - 1,
              })
            : h(ElementComp, {
                element: n,
                key: key.id,
                decorations: mutableDecorationsByChild[i],
              });
        });
      }

      const chunkTree = getChunkTreeForNode(editor, props.element, {
        reconcile: {
          chunkSize,
          rerenderChildren: childrenToRedecorate,
          onInsert: (n, i) => {
            NODE_TO_INDEX.set(n, i);
            NODE_TO_PARENT.set(n, props.element);
          },
          onUpdate: (n, i) => {
            NODE_TO_INDEX.set(n, i);
            NODE_TO_PARENT.set(n, props.element);
          },
          onIndexChange: (n, i) => {
            NODE_TO_INDEX.set(n, i);
          },
        },
      });

      return h(ChunkTreeComp, {
        root: chunkTree,
        ancestor: chunkTree,
        renderElement: renderElementComponent,
        renderChunk: renderChunk,
      });
    };
  },
});
