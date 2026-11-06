import { Editor, Path, Range } from "slate";
import { DOMEditor, getSelection, isDOMNode } from "slate-vue3/dom";

export const removeStrayComposition = (editor: Editor, data: string) => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return;

  const domSelection = getSelection(DOMEditor.findDocumentOrShadowRoot(editor));
  const node = domSelection?.anchorNode;
  if (!domSelection || !isDOMNode(node) || node.nodeType !== node.TEXT_NODE) {
    return;
  }

  const textNode = node as globalThis.Text;
  const end = domSelection.anchorOffset;
  const start = end - data.length;
  if (start < 0 || textNode.data.slice(start, end) !== data) return;
  if (!DOMEditor.hasDOMNode(editor, textNode, { editable: true })) return;

  const leafPath = DOMEditor.findPath(
    editor,
    DOMEditor.toSlateNode(editor, textNode),
  );
  const insertsIntoLeaf =
    Path.equals(leafPath, selection.anchor.path) &&
    !Editor.void(editor, { at: selection });
  if (insertsIntoLeaf) return;

  textNode.deleteData(start, data.length);
};
