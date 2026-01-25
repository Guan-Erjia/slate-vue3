import { Descendant, Element } from "slate";
import { toRaw } from "vue";
import { ChunkLeaf, ChunkTree } from "./types";
import { ChunkTreeHelper, ChunkTreeHelperOptions } from "./chunk-tree-helper";
import { NODE_TO_OLD_CHILDREN } from "./get-chunk-tree-for-node";
import { Key } from "../utils/key";

export interface ReconcileOptions extends ChunkTreeHelperOptions {
  chunkTree: ChunkTree;
  chunkSize: number;
  onInsert?: (node: Descendant, index: number) => void;
  onIndexChange?: (node: Descendant, index: number) => void;
  debug?: boolean;
}

export type Patch =
  | {
      type: "remove";
      index: number;
    }
  | {
      type: "insert";
      index: number;
      node: Descendant;
    }
  | {
      type: "move";
      from: number;
      to: number;
    };

function lis(arr: readonly number[]): number[] {
  const p = arr.slice();
  const result: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    const n = arr[i];
    if (n === 0) continue;

    let l = 0;
    let r = result.length;

    while (l < r) {
      const m = (l + r) >> 1;
      if (arr[result[m]] < n) l = m + 1;
      else r = m;
    }

    p[i] = l > 0 ? result[l - 1] : -1;
    result[l] = i;
  }

  let u = result.length;
  let v = result[u - 1];

  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}

function isMostlyOrdered(arr: number[]): boolean {
  let last = 0;
  for (const n of arr) {
    if (n === 0) continue;
    if (n < last) return false;
    last = n;
  }
  return true;
}

function diffListEditorOptimized<T extends Descendant>(
  oldChildren: readonly T[],
  newChildren: readonly T[],
): Patch[] {
  const ops: Patch[] = [];

  let i = 0;
  let e1 = oldChildren.length - 1;
  let e2 = newChildren.length - 1;

  // 1️⃣ sync from start
  while (i <= e1 && i <= e2 && oldChildren[i] === newChildren[i]) {
    i++;
  }

  // 2️⃣ sync from end
  while (i <= e1 && i <= e2 && oldChildren[e1] === newChildren[e2]) {
    e1--;
    e2--;
  }

  // 3️⃣ simple cases
  if (i > e1) {
    for (let j = i; j <= e2; j++) {
      ops.push({ type: "insert", index: j, node: newChildren[j] });
    }
    return ops;
  }

  if (i > e2) {
    for (let j = e1; j >= i; j--) {
      ops.push({ type: "remove", index: j });
    }
    return ops;
  }

  // 4️⃣ middle diff
  const s1 = i;
  const s2 = i;
  const toBePatched = e2 - s2 + 1;

  const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
  const matched = new Array(e2 + 1).fill(false);

  for (let i = s1; i <= e1; i++) {
    let found = false;

    for (let j = s2; j <= e2; j++) {
      if (!matched[j] && oldChildren[i] === newChildren[j]) {
        matched[j] = true;
        newIndexToOldIndexMap[j - s2] = i + 1;
        found = true;
        break;
      }
    }

    if (!found) {
      ops.push({ type: "remove", index: i });
    }
  }

  const needLIS = toBePatched > 8 && !isMostlyOrdered(newIndexToOldIndexMap);

  let increasingSeq: number[] = [];

  if (needLIS) {
    increasingSeq = lis(newIndexToOldIndexMap);
  }

  let j = increasingSeq.length - 1;

  for (let i = toBePatched - 1; i >= 0; i--) {
    const newIndex = i + s2;
    const oldIndexPlusOne = newIndexToOldIndexMap[i];

    if (oldIndexPlusOne === 0) {
      ops.push({
        type: "insert",
        index: newIndex,
        node: newChildren[newIndex],
      });
    } else if (needLIS) {
      if (j < 0 || i !== increasingSeq[j]) {
        ops.push({
          type: "move",
          from: oldIndexPlusOne - 1,
          to: newIndex,
        });
      } else {
        j--;
      }
    }
  }

  return ops;
}

/**
 * Update the chunk tree to match the children array, inserting, removing and
 * updating differing nodes
 */
export const reconcileChildren = (
  element: Element,
  options: ReconcileOptions,
) => {
  console.time("[reconcileChildren]");
  const shallowCloneChildren = toRaw(element.children).slice();
  const _children = NODE_TO_OLD_CHILDREN.get(element) || [];
  const patches = diffListEditorOptimized(_children, shallowCloneChildren);
  patches.forEach((patch) => {
    if (patch.type === "insert") {
      patch.node = element.children[patch.index];
    }
  });

  const chunkTreeHelper = new ChunkTreeHelper(options.chunkTree, options);

  for (let i = patches.length - 1; i >= 0; i--) {
    const p = patches[i];
    if (p.type === "remove") {
      chunkTreeHelper.removeAt(p.index);
    }
  }

  for (const p of patches) {
    if (p.type === "move") {
      chunkTreeHelper.move(p.from, p.to);
    }
  }

  for (const p of patches) {
    if (p.type === "insert") {
      const leaf: ChunkLeaf = {
        type: "leaf",
        key: new Key(),
        node: p.node,
        index: p.index,
      };
      chunkTreeHelper.insertAt(p.index, leaf);
      options.onInsert?.(p.node, p.index);
    }
  }

  chunkTreeHelper.restorePointer("start");

  let leaf;
  let index = 0;
  while ((leaf = chunkTreeHelper.readLeaf())) {
    if (leaf.index !== index) {
      leaf.index = index;
      options.onIndexChange?.(leaf.node, index);
    }
    index++;
  }

  console.timeEnd("[reconcileChildren]");

  NODE_TO_OLD_CHILDREN.set(element, shallowCloneChildren);
};
