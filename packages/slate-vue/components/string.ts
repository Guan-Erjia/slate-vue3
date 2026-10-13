import { Editor, Node, Path, Text, Element } from "slate";
import { DOMEditor, IS_FIREFOX, MARK_PLACEHOLDER_SYMBOL } from "slate-vue3/dom";
import { defineComponent, h, VNodeRef } from "vue";
import { useEditor } from "../hooks/use-editor";

export const StringComp = defineComponent({
  name: "slate-string",
  props: ["leaf", "text", "isLast", "parent"],
  setup(props: { leaf: Text; text: Text; isLast: boolean; parent: Element }) {
    const editor = useEditor();

    return () => {
      const isMarkPlaceholder = Boolean(props.leaf[MARK_PLACEHOLDER_SYMBOL]);
      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.
      if (editor.isVoid(props.parent)) {
        return ZeroWidthString({
          length: Node.string(props.parent).length,
        });
      }
      // COMPAT: If this is the last text node in an empty block, render a zero-
      // width space that will convert into a line break when copying and pasting
      // to support expected plain text.
      const path = DOMEditor.findPath(editor, props.text);
      const parentPath = Path.parent(path);
      if (
        props.leaf.text === "" &&
        props.parent.children[props.parent.children.length - 1] ===
          props.text &&
        !editor.isInline(props.parent) &&
        Editor.string(editor, parentPath) === ""
      ) {
        return ZeroWidthString({
          isLineBreak: true,
          isMarkPlaceholder: isMarkPlaceholder,
        });
      }

      // COMPAT: If the text is empty, it's because it's on the edge of an inline
      // node, so we render a zero-width space so that the selection can be
      // inserted next to it still.
      if (props.leaf.text === "") {
        return ZeroWidthString({
          isMarkPlaceholder: isMarkPlaceholder,
        });
      }

      // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
      // so we need to add an extra trailing new lines to prevent that.
      if (props.isLast && props.leaf.text.endsWith("\n")) {
        return TextString({
          isTrailing: true,
          text: props.leaf.text,
        });
      }
      return TextString({ text: props.leaf.text });
    };
  },
});

const TextString = (props: { text: string; isTrailing?: boolean }) => {
  const setRef: VNodeRef = (el) => {
    if (!el) return;
    const span = el as HTMLSpanElement;

    if (IS_FIREFOX) {
      span.toggleAttribute("data-slate-trailing", !!props.isTrailing);
    }

    const textNode = span.firstChild;
    if (
      IS_FIREFOX &&
      props.isTrailing &&
      span.childNodes.length === 1 &&
      textNode?.nodeType === 3
    ) {
      (textNode as globalThis.Text).splitText(props.text.length);
    }
  };

  return h(
    "span",
    {
      "data-slate-string": true,
      ref: setRef,
    },
    `${props.text ?? ""}${props.isTrailing ? "\n" : ""}`,
  );
};

const ZeroWidthString = (props: {
  length?: number;
  isMarkPlaceholder?: boolean;
  isLineBreak?: boolean;
}) => {
  // FIXME: Inserting the \uFEFF on iOS breaks capitalization at the start of an
  // empty editor (https://github.com/ianstormtaylor/slate/issues/5199).
  //
  // However, not inserting the \uFEFF on iOS causes the editor to crash when
  // inserting any text using an IME at the start of a block. This appears to
  // be because accepting an IME suggestion when at the start of a block (no
  // preceding \uFEFF) removes one or more DOM elements that `toSlateRange`
  // depends on. (https://github.com/ianstormtaylor/slate/issues/5703)
  const attributes: {
    "data-slate-zero-width": string;
    "data-slate-length": number;
    "data-slate-mark-placeholder"?: boolean;
  } = {
    "data-slate-zero-width": props.isLineBreak ? "n" : "z",
    "data-slate-length": length,
  };

  if (props.isMarkPlaceholder) {
    attributes["data-slate-mark-placeholder"] = true;
  }
  return h("span", attributes, ["\uFEFF", props.isLineBreak ? h("br") : null]);
};
