import {
  Ancestor,
  Descendant,
  Element,
  Node,
  Path,
  Scrubber,
  Text,
} from "../interfaces";

export const insertChildren = <T>(
  xs: T[],
  index: number,
  ...newValues: T[]
) => {
  xs.splice(index, 0, ...newValues);
};

export const replaceChildren = <T>(
  xs: T[],
  index: number,
  removeCount: number,
  ...newValues: T[]
) => {
  xs.splice(index, removeCount, ...newValues);
};

export const removeChildren = replaceChildren;

/**
 * Replace a descendant with a new node, replacing all ancestors
 */
export const modifyDescendant = <N extends Node>(
  root: Ancestor,
  path: Path,
  f: (node: Node) => void,
) => {
  if (path.length === 0) {
    throw new Error("Cannot modify the editor");
  }

  const node = Node.get(root, path);
  f(node);
};

/**
 * Replace the children of a node, replacing all ancestors
 */
export const modifyChildren = (
  root: Ancestor,
  path: Path,
  f: (children: Descendant[]) => void,
) => {
  if (path.length === 0) {
    f(root.children);
  } else {
    modifyDescendant<Element>(root, path, (node) => {
      if (Text.isText(node)) {
        throw new Error(
          `Cannot get the element at path [${path}] because it refers to a leaf node: ${Scrubber.stringify(
            node,
          )}`,
        );
      }

      f(node.children);
    });
  }
};

/**
 * Replace a leaf, replacing all ancestors
 */
export const modifyLeaf = (
  root: Ancestor,
  path: Path,
  f: (leaf: Text) => void,
) => {
  modifyDescendant(root, path, (node) => {
    if (!Text.isText(node)) {
      throw new Error(
        `Cannot get the leaf node at path [${path}] because it refers to a non-leaf node: ${Scrubber.stringify(
          node,
        )}`,
      );
    }

    f(node);
  });
};
