import { Ancestor, Editor, Element, DecoratedRange, Text } from "slate";
import {
  DOMEditor,
  Key,
  isElementDecorationsEqual,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  splitDecorationsByChild,
} from "slate-dom";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { getChunkTreeForNode } from "slate-dom";
import { ChunkComp } from "../components/chunk";
import { Fragment, h, ref, VNode } from "vue";

/**
 * Children.
 */
const useChildren = (props: {
  decorations: DecoratedRange[];
  node: Ancestor;
  editor: DOMEditor;
}): VNode => {
  const { decorations, node, editor } = props;

  const isEditor = Editor.isEditor(node);
  const isBlock =
    !isEditor && Element.isElement(node) && !editor.isInline(node);
  const isLeafBlock = isBlock && Editor.hasInlines(editor, node);
  const chunkSize = isLeafBlock ? null : editor.getChunkSize(node);
  const chunking = !!chunkSize;

  const { decorationsByChild, childrenToRedecorate } = useDecorationsByChild(
    editor,
    node,
    decorations
  );

  // Update the index and parent of each child.
  // PERF: If chunking is enabled, this is done while traversing the chunk tree
  // instead to eliminate unnecessary weak map operations.
  if (!chunking) {
    node.children.forEach((n, i) => {
      NODE_TO_INDEX.set(n, i);
      NODE_TO_PARENT.set(n, node);
    });
  }

  const renderElementComponent = (n: Element, i: number, cachedKey?: Key) => {
    const key = cachedKey ?? DOMEditor.findKey(editor, n);

    return h(ElementComp, {
      decorations: decorationsByChild[i],
      element: n,
      key: key.id,
    });
  };

  const renderTextComponent = (n: Text, i: number) => {
    const key = DOMEditor.findKey(editor, n);

    return h(TextComp, {
      decorations: decorationsByChild[i],
      text: n,
      element: node,
      key: key.id,
    });
  };

  if (!chunking) {
    return h(
      Fragment,
      node.children.map((n, i) =>
        Text.isText(n)
          ? renderTextComponent(n, i)
          : renderElementComponent(n, i)
      )
    );
  }

  const chunkTree = getChunkTreeForNode(editor, node, {
    reconcile: {
      chunkSize,
      rerenderChildren: childrenToRedecorate,
      onInsert: (n, i) => {
        NODE_TO_INDEX.set(n, i);
        NODE_TO_PARENT.set(n, node);
      },
      onUpdate: (n, i) => {
        NODE_TO_INDEX.set(n, i);
        NODE_TO_PARENT.set(n, node);
      },
      onIndexChange: (n, i) => {
        NODE_TO_INDEX.set(n, i);
      },
    },
  });

  return h(ChunkComp, {
    root: chunkTree,
    ancestor: chunkTree,
    renderElement: renderElementComponent,
  });
};

const useDecorationsByChild = (
  editor: DOMEditor,
  node: Ancestor,
  decorations: DecoratedRange[]
) => {
  const decorationsByChild = splitDecorationsByChild(editor, node, decorations);

  // The value we return is a mutable array of `DecoratedRange[]` arrays. This
  // lets us avoid passing an immutable array of decorations for each child into
  // `ChunkTree` using props. Each `DecoratedRange[]` is only updated if the
  // decorations at that index have changed, which speeds up the equality check
  // for the `decorations` prop in the memoized `Element` and `Text` components.
  const mutableDecorationsByChild = ref(decorationsByChild).value;

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

export default useChildren;
