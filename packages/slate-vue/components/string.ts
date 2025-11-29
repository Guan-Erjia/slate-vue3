import { Node, Text } from "slate";
import { IS_ANDROID, IS_FIREFOX, MARK_PLACEHOLDER_SYMBOL } from "slate-dom";
import { computed, defineComponent, h } from "vue";
import { useEditor } from "../hooks/use-editor";
import { useElement } from "../hooks/use-element";
import { injectInnerIsLastEmptyBlock } from "../render/last";

export const StringComp = defineComponent({
  name: "slate-string",
  props: ["leaf", "text", "isLast"],
  setup(props: { leaf: Text; text: Text; isLast: boolean }) {
    const { leaf, text, isLast } = props;
    const editor = useEditor();
    const element = useElement();

    const getTextContent = computed(() => {
      const text = leaf.text;
      return (text ?? "") + (isLast && text.at(-1) === "\n" ? "\n" : "");
    });

    // COMPAT: If this is the last text node in an empty block, render a zero-
    // width space that will convert into a line break when copying and pasting
    // to support expected plain text.
    const isLastEmptyBlock = injectInnerIsLastEmptyBlock();
    const isLineBreak = computed(() => {
      return (
        leaf.text === "" &&
        element.value.children.at(-1) === text &&
        isLastEmptyBlock.value
      );
    });

    const zeroStringAttrs = computed(() => {
      const length = Node.string(element.value).length || 0;
      const isMarkPlaceholder = Boolean(leaf[MARK_PLACEHOLDER_SYMBOL]) || false;
      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.
      const isVoidParent = editor.isVoid(element.value);
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
            !IS_ANDROID || !isLineBreak.value ? "\uFEFF" : null,
            !IS_FIREFOX && isLineBreak.value ? h("br") : null,
          ])
        : h("span", { "data-slate-string": true }, getTextContent.value);
  },
});
