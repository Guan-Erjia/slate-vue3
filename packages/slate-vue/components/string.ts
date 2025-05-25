import { Editor, Path, Node, Element, Text } from "slate";
import {
  IS_ANDROID,
  IS_FIREFOX,
  DOMEditor,
  MARK_PLACEHOLDER_SYMBOL,
} from "slate-dom";
import { computed, defineComponent, h } from "vue";
import { useEditor } from "../hooks/use-editor";

export const StringComp = defineComponent({
  name: "slate-string",
  props: ["leaf", "text", "element", "isLast"],
  setup(props: { leaf: Text; text: Text; element: Element; isLast: boolean }) {
    const { leaf, text, element, isLast } = props;
    const editor = useEditor();

    const getTextContent = computed(() => {
      const text = leaf.text;
      return (text ?? "") + (isLast && text.at(-1) === "\n" ? "\n" : "");
    });

    // COMPAT: If this is the last text node in an empty block, render a zero-
    // width space that will convert into a line break when copying and pasting
    // to support expected plain text.
    const isLineBreak = computed(() => {
      const pathParent = Path.parent(DOMEditor.findPath(editor, text));
      return (
        leaf.text === "" &&
        element.children.at(-1) === text &&
        !editor.isInline(element) &&
        Editor.string(editor, pathParent) === ""
      );
    });

    const zeroStringAttrs = computed(() => {
      const length = Node.string(element).length || 0;
      const isMarkPlaceholder = Boolean(leaf[MARK_PLACEHOLDER_SYMBOL]) || false;
      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.
      const isVoidParent = editor.isVoid(element);
      if (isVoidParent || isLineBreak.value || leaf.text === "") {
        return {
          "data-slate-zero-width": isLineBreak.value ? "n" : "z",
          "data-slate-length": length,
          "data-slate-mark-placeholder": isMarkPlaceholder ? true : undefined,
        };
      }
      return null;
    });

    // FIXME: Inserting the \uFEFF on iOS breaks capitalization at the start of an
    // empty editor (https://github.com/ianstormtaylor/slate/issues/5199).
    //
    // However, not inserting the \uFEFF on iOS causes the editor to crash when
    // inserting any text using an IME at the start of a block. This appears to
    // be because accepting an IME suggestion when at the start of a block (no
    // preceding \uFEFF) removes one or more DOM elements that `toSlateRange`
    // depends on. (https://github.com/ianstormtaylor/slate/issues/5703)
    return () =>
      zeroStringAttrs.value
        ? h("span", zeroStringAttrs.value, [
            !IS_ANDROID || !isLineBreak ? "\uFEFF" : null,
            isLineBreak && !IS_FIREFOX ? h("br") : null,
          ])
        : h("span", { "data-slate-string": true }, getTextContent.value);
  },
});
