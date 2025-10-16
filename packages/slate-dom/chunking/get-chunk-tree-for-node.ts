import { Ancestor } from "slate";
import { DOMEditor, Key } from "slate-dom";
import { ChunkTree } from "./types";
import { ReconcileOptions, reconcileChildren } from "./reconcile-children";
import { reactive } from "vue";

export const KEY_TO_CHUNK_TREE = new WeakMap<Key, ChunkTree>();

/**
 * Get or create the chunk tree for a Slate node
 *
 * If the reconcile option is provided, the chunk tree will be updated to
 * match the current children of the node. The children are chunked
 * automatically using the given chunk size.
 */
export const getChunkTreeForNode = (
  editor: DOMEditor,
  node: Ancestor,
  // istanbul ignore next
  options: {
    reconcile?: Omit<ReconcileOptions, "chunkTree" | "children"> | false;
  } = {},
) => {
  const key = DOMEditor.findKey(editor, node);
  let chunkTree = KEY_TO_CHUNK_TREE.get(key);
  if (!chunkTree) {
    chunkTree = {
      type: "root",
      movedNodeKeys: new Set(),
      children: reactive([]),
    };

    KEY_TO_CHUNK_TREE.set(key, chunkTree);
  }

  if (options.reconcile) {
    reconcileChildren(editor, {
      chunkTree,
      children: node.children,
      ...options.reconcile,
    });
  }
  return chunkTree;
};
