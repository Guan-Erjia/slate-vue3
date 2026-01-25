import { Ancestor, Descendant, Element } from "slate";
import {
  ChunkLeaf,
  ChunkAncestor,
  ChunkDescendant,
  Chunk,
  ChunkTree,
} from "./types";
import { DOMEditor } from "../plugin/dom-editor";
import { NODE_TO_INDEX, NODE_TO_PARENT } from "../utils/weak-maps";
import { Key } from "../utils/key";
import { shallowReactive, toRaw } from "vue";

const buildLevel = (
  nodes: ChunkLeaf[],
  parent: ChunkAncestor,
  chunkSize: number,
): ChunkDescendant[] => {
  if (nodes.length <= chunkSize) {
    return nodes;
  }

  const chunks: Chunk[] = [];

  for (let i = 0; i < nodes.length; i += chunkSize) {
    const slice = nodes.slice(i, i + chunkSize);

    const chunk: Chunk = {
      type: "chunk",
      key: new Key(),
      parent,
      children: [],
    };

    chunk.children = shallowReactive(buildLevel(slice, chunk, chunkSize));

    chunks.push(chunk);
  }

  return chunks;
};

/**
 * Update the chunk tree to match the children array, inserting, removing and
 * updating differing nodes
 */
const buildChunkTree = (
  editor: DOMEditor,
  element: Element,
  chunkTree: ChunkTree,
  chunkSize: number,
) => {
  const leavesToInsert: ChunkLeaf[] = element.children.map((node, i) => ({
    type: "leaf",
    node,
    key: DOMEditor.findKey(editor, node),
    index: i,
  }));

  chunkTree.children = shallowReactive(
    buildLevel(leavesToInsert, chunkTree, chunkSize),
  );

  for (let i = 0; i < element.children.length; i++) {
    NODE_TO_INDEX.set(element.children[i], i);
    NODE_TO_PARENT.set(element.children[i], element);
  }

  chunkTree.movedNodeKeys.clear();
};

export const KEY_TO_CHUNK_TREE = new WeakMap<Key, ChunkTree>();
export const NODE_TO_OLD_CHILDREN = new WeakMap<Ancestor, Descendant[]>();

/**
 * Get or create the chunk tree for a Slate node
 *
 * If the reconcile option is provided, the chunk tree will be updated to
 * match the current children of the node. The children are chunked
 * automatically using the given chunk size.
 */
export const getChunkTreeForNode = (editor: DOMEditor, node: Ancestor) => {
  const key = DOMEditor.findKey(editor, node);
  let chunkTree = KEY_TO_CHUNK_TREE.get(key);
  if (!chunkTree) {
    chunkTree = {
      type: "root",
      movedNodeKeys: new Set(),
      children: shallowReactive([]),
    };

    buildChunkTree(
      editor,
      node,
      chunkTree,
      editor.getChunkSize(node) as number,
    );

    NODE_TO_OLD_CHILDREN.set(node, toRaw(node.children).slice());
    KEY_TO_CHUNK_TREE.set(key, chunkTree);
  }
  return chunkTree;
};
