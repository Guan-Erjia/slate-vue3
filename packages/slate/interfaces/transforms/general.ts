import {
  Ancestor,
  Descendant,
  Editor,
  Element,
  Node,
  NodeEntry,
  Operation,
  Path,
  Point,
  Range,
  Scrubber,
  Selection,
  Text,
} from "../../index";

export interface GeneralTransforms {
  /**
   * Transform the editor by an operation.
   */
  transform: (editor: Editor, op: Operation) => void;
}

export const GeneralTransforms: GeneralTransforms = {
  transform(editor: Editor, op: Operation): void {
    let transformSelection = false;
    switch (op.type) {
      case "insert_node": {
        const { path, node } = op;
        const parent = Node.parent(editor, path);
        const index = path[path.length - 1];
        if (index > parent.children.length) {
          throw new Error(
            `Cannot apply an 'insert_node' operation at path [${path}] because the destination is past the end of the node.`
          );
        }

        parent.children.splice(index, 0, node);

        transformSelection = true;
        break;
      }

      case "insert_text": {
        const { path, offset, text } = op;
        if (text.length === 0) break;
        const node = Node.leaf(editor, path);
        const before = node.text.slice(0, offset);
        const after = node.text.slice(offset);
        node.text = before + text + after;

        transformSelection = true;
        break;
      }

      case "merge_node": {
        const { path } = op;
        const node = Node.get(editor, path);
        const prevPath = Path.previous(path);
        const prev = Node.get(editor, prevPath);
        const parent = Node.parent(editor, path);
        const index = path[path.length - 1];

        if (Text.isText(node) && Text.isText(prev)) {
          prev.text += node.text;
        } else if (!Text.isText(node) && !Text.isText(prev)) {
          prev.children.push(...node.children);
        } else {
          throw new Error(
            `Cannot apply a 'merge_node' operation at path [${path}] to nodes of different interfaces: ${Scrubber.stringify(
              node
            )} ${Scrubber.stringify(prev)}`
          );
        }

        parent.children.splice(index, 1);

        transformSelection = true;
        break;
      }

      case "move_node": {
        const { path, newPath } = op;

        if (Path.isAncestor(path, newPath)) {
          throw new Error(
            `Cannot move a path [${path}] to new path [${newPath}] because the destination is inside itself.`
          );
        }

        const node = Node.get(editor, path);
        const parent = Node.parent(editor, path);
        const index = path[path.length - 1];

        // This is tricky, but since the `path` and `newPath` both refer to
        // the same snapshot in time, there's a mismatch. After either
        // removing the original position, the second step's path can be out
        // of date. So instead of using the `op.newPath` directly, we
        // transform `op.path` to ascertain what the `newPath` would be after
        // the operation was applied.
        parent.children.splice(index, 1);
        const truePath = Path.transform(path, op)!;
        const newParent = Node.get(editor, Path.parent(truePath)) as Ancestor;
        const newIndex = truePath[truePath.length - 1];
        newParent.children.splice(newIndex, 0, node);
        transformSelection = true;
        break;
      }

      case "remove_node": {
        const { path } = op;
        const index = path[path.length - 1];
        const parent = Node.parent(editor, path);
        parent.children.splice(index, 1);

        // Transform all the points in the value, but if the point was in the
        // node that was removed we need to update the range or remove it.
        if (editor.selection) {
          let selection: Selection = { ...editor.selection };

          for (const [point, key] of Range.points(selection)) {
            const result = Point.transform(point, op);

            if (selection != null && result != null) {
              selection[key] = result;
            } else {
              let prev: NodeEntry<Text> | undefined;
              let next: NodeEntry<Text> | undefined;

              for (const [n, p] of Node.texts(editor)) {
                if (Path.compare(p, path) === -1) {
                  prev = [n, p];
                } else {
                  next = [n, p];
                  break;
                }
              }

              let preferNext = false;
              if (prev && next) {
                if (Path.equals(next[1], path)) {
                  preferNext = !Path.hasPrevious(next[1]);
                } else {
                  preferNext =
                    Path.common(prev[1], path).length <
                    Path.common(next[1], path).length;
                }
              }

              if (prev && !preferNext) {
                selection![key] = {
                  path: prev[1],
                  offset: prev[0].text.length,
                };
              } else if (next) {
                selection![key] = { path: next[1], offset: 0 };
              } else {
                selection = null;
              }
            }
          }

          if (!selection || !Range.equals(selection, editor.selection)) {
            editor.selection = selection;
          }
        }

        break;
      }

      case "remove_text": {
        const { path, offset, text } = op;
        if (text.length === 0) break;
        const node = Node.leaf(editor, path);
        const before = node.text.slice(0, offset);
        const after = node.text.slice(offset + text.length);
        node.text = before + after;

        transformSelection = true;
        break;
      }

      case "set_node": {
        const { path, properties, newProperties } = op;

        if (path.length === 0) {
          throw new Error(`Cannot set properties on the root node!`);
        }

        const node = Node.get(editor, path);

        for (const key in newProperties) {
          if (key === "children" || key === "text") {
            throw new Error(`Cannot set the '${key}' property of nodes!`);
          }

          const value = newProperties[<keyof Node>key];

          if (value == null) {
            delete node[<keyof Node>key];
          } else {
            node[<keyof Node>key] = value;
          }
        }

        // properties that were previously defined, but are now missing, must be deleted
        for (const key in properties) {
          if (!newProperties.hasOwnProperty(key)) {
            delete node[<keyof Node>key];
          }
        }

        break;
      }

      case "set_selection": {
        const { newProperties } = op;

        if (newProperties == null) {
          editor.selection = null;
          break;
        }

        if (editor.selection == null) {
          if (!Range.isRange(newProperties)) {
            throw new Error(
              `Cannot apply an incomplete 'set_selection' operation properties ${Scrubber.stringify(
                newProperties
              )} when there is no current selection.`
            );
          }

          editor.selection = { ...newProperties };
          break;
        }
        const selection = { ...editor.selection };

        for (const key in newProperties) {
          const value = newProperties[<keyof Range>key];

          if (value == null) {
            if (key === "anchor" || key === "focus") {
              throw new Error(`Cannot remove the '${key}' selection property`);
            }

            delete selection[<keyof Range>key];
          } else {
            selection[<keyof Range>key] = value;
          }
        }

        editor.selection = selection;

        break;
      }

      case "split_node": {
        const { path, position, properties } = op;

        if (path.length === 0) {
          throw new Error(
            `Cannot apply a 'split_node' operation at path [${path}] because the root node cannot be split.`
          );
        }

        const node = Node.get(editor, path);
        const parent = Node.parent(editor, path);
        const index = path[path.length - 1];
        let newNode: Descendant;

        if (Text.isText(node)) {
          const before = node.text.slice(0, position);
          const after = node.text.slice(position);
          node.text = before;
          newNode = {
            ...(properties as Partial<Text>),
            text: after,
          };
        } else {
          const before = node.children.slice(0, position);
          const after = node.children.slice(position);
          node.children = before;

          newNode = {
            ...(properties as Partial<Element>),
            children: after,
          };
        }

        parent.children.splice(index + 1, 0, newNode);

        transformSelection = true;
        break;
      }
    }

    if (transformSelection && editor.selection) {
      const selection = { ...editor.selection };

      for (const [point, key] of Range.points(selection)) {
        selection[key] = Point.transform(point, op)!;
      }

      if (!Range.equals(selection, editor.selection)) {
        editor.selection = selection;
      }
    }
  },
};
