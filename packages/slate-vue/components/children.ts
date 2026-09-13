import { Ancestor, DecoratedRange, Editor, Node, Element } from "slate";
import {
  DOMEditor,
  isElementDecorationsEqual,
  Key,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  splitDecorationsByChild,
} from "slate-vue3/dom";
import { computed, defineComponent, h, renderList, VNode } from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkComp } from "../components/chunk";
import { useEditor } from "../hooks/use-editor";
import { provideIsLastEmptyBlock } from "../render/last";
import { getChunkTreeForNode } from "../chunking";

const useDecorationsByChild = (
  editor: DOMEditor,
  node: Ancestor,
  decorations: DecoratedRange[],
) => {
  const decorationsByChild = splitDecorationsByChild(editor, node, decorations);

  // The value we return is a mutable array of `DecoratedRange[]` arrays. This
  // lets us avoid passing an immutable array of decorations for each child into
  // `ChunkTree` using props. Each `DecoratedRange[]` is only updated if the
  // decorations at that index have changed, which speeds up the equality check
  // for the `decorations` prop in the memoized `Element` and `Text` components.
  const mutableDecorationsByChild = decorationsByChild;

  // Track the list of child indices whose decorations have changed, so that we
  // can tell the chunk tree to re-render these children.
  const childrenToRedecorate: number[] = [];

  // Resize the mutable array to match the latest result
  mutableDecorationsByChild.length = decorationsByChild.length;

  for (let i = 0; i < decorationsByChild.length; i++) {
    const decorations = decorationsByChild[i];

    const previousDecorations: DecoratedRange[] | null =
      mutableDecorationsByChild[i] ?? null;

    if (!isElementDecorationsEqual(previousDecorations, decorations)) {
      mutableDecorationsByChild[i] = decorations;
      childrenToRedecorate.push(i);
    }
  }

  return {
    decorationsByChild: mutableDecorationsByChild,
    childrenToRedecorate,
  };
};

/**
 * Children.
 */
export const ChildrenComp = defineComponent({
  name: "slate-children",
  props: ["element", "decorations"],
  setup(props: { element: Ancestor; decorations: DecoratedRange[] }) {
    const editor = useEditor();

    const isBlock =
      Node.isElement(props.element) && !editor.isInline(props.element);

    const chunkSize = Editor.hasInlines(editor, props.element)
      ? null
      : editor.getChunkSize(props.element);

    if (isBlock || chunkSize === null) {
      provideIsLastEmptyBlock(props.element);
    }

    const decorations = computed(() => {
      return useDecorationsByChild(editor, props.element, props.decorations);
    });

    return () => {
      const { decorationsByChild, childrenToRedecorate } = decorations.value;

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
                decorations: decorationsByChild[i],
                isLast: i === props.element.children.length - 1,
              })
            : h(ElementComp, {
                element: n,
                key: key.id,
                decorations: decorationsByChild[i],
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

      const renderElementComponent = (
        n: Element,
        i: number,
        cachedKey?: Key,
      ): VNode => {
        const key = cachedKey ?? DOMEditor.findKey(editor, n);
        return h(ElementComp, {
          decorations: decorationsByChild[i],
          element: n,
          key: key.id,
        });
      };

      return h(ChunkComp, {
        root: chunkTree,
        ancestor: chunkTree,
        renderElement: renderElementComponent,
      });
    };
  },
});
