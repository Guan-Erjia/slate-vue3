import { Ancestor } from "slate";
import { DOMEditor, Key } from "slate-dom";
import { ChunkTree } from "./types";
import { ReconcileOptions, reconcileChildren } from "./reconcile-children";
import { toRawWeakMap as WeakMap } from "share-tools";
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
  } = {}
) => {
  const key = DOMEditor.findKey(editor, node);
  let chunkTree = KEY_TO_CHUNK_TREE.get(key);
  if (!chunkTree) {
    chunkTree = {
      type: "root",
      movedNodeKeys: new Set(),
      modifiedChunks: new Set(),
      // fixme 这里必须二次代理，不然会丢失响应，无法更新 DOM
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
