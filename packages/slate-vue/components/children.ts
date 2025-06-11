import { Ancestor, Editor, Element, Text } from "slate";
import {
  DOMEditor,
  Key,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  getChunkTreeForNode,
} from "slate-dom";
import { Fragment, h, VNode } from "vue";
import { ElementComp } from "../components/element";
import { TextComp } from "../components/text";
import { ChunkComp } from "../components/chunk";

/**
 * Children.
 */
export const ChildrenFC = (node: Ancestor, editor: DOMEditor): VNode => {
  const isEditor = Editor.isEditor(node);
  const isBlock =
    !isEditor && Element.isElement(node) && !editor.isInline(node);
  const isLeafBlock = isBlock && Editor.hasInlines(editor, node);
  const chunkSize = isLeafBlock ? null : editor.getChunkSize(node);
  const chunking = !!chunkSize;

  if (!chunking) {
    return h(
      Fragment,
      node.children.map((n, i) => {
        // Update the index and parent of each child.
        // PERF: If chunking is enabled, this is done while traversing the chunk tree
        // instead to eliminate unnecessary weak map operations.
        NODE_TO_INDEX.set(n, i);
        NODE_TO_PARENT.set(n, node);
        const key = DOMEditor.findKey(editor, n);
        return Text.isText(n)
          ? h(TextComp, {
              text: n,
              element: node,
              key: key.id,
            })
          : h(ElementComp, {
              element: n,
              key: key.id,
            });
      })
    );
  }

  const chunkTree = getChunkTreeForNode(editor, node, {
    reconcile: {
      chunkSize,
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
  });
};
