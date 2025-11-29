import { Node, Text } from "slate";
import { IS_ANDROID, MARK_PLACEHOLDER_SYMBOL } from "slate-dom";
import { defineComponent, h } from "vue";
import { useEditor } from "../hooks/use-editor";
import { useElement } from "../hooks/use-element";
import { injectIsLastEmptyBlock } from "../render/last";

export const StringComp = defineComponent({
  name: "slate-string",
  props: ["leaf", "text", "isLast"],
  setup(props: { leaf: Text; text: Text; isLast: boolean }) {
    const editor = useEditor();
    const element = useElement();
    const isLastEmptyBlock = injectIsLastEmptyBlock();

    return () => {
      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.
      if (editor.isVoid(element.value)) {
        return h(ZeroWidthString, {
          length: Node.string(element.value).length,
        });
      }
      // COMPAT: If this is the last text node in an empty block, render a zero-
      // width space that will convert into a line break when copying and pasting
      // to support expected plain text.
      if (
        props.leaf.text === "" &&
        element.value.children.at(-1) === props.text &&
        isLastEmptyBlock.value
      ) {
        return h(ZeroWidthString, {
          isLineBreak: true,
          isMarkPlaceholder: props.leaf[MARK_PLACEHOLDER_SYMBOL] === true,
        });
      }

      // COMPAT: If the text is empty, it's because it's on the edge of an inline
      // node, so we render a zero-width space so that the selection can be
      // inserted next to it still.
      if (props.leaf.text === "") {
        return h(ZeroWidthString, {
          isMarkPlaceholder: props.leaf[MARK_PLACEHOLDER_SYMBOL] === true,
        });
      }

      // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
      // so we need to add an extra trailing new lines to prevent that.
      if (props.isLast && props.leaf.text.endsWith("\n")) {
        return h(TextString, {
          isTrailing: true,
          text: props.leaf.text,
        });
      }
      return h(TextString, { text: props.leaf.text });
    };
  },
});

const TextString = defineComponent({
  name: "slate-text-string",
  props: ["text", "isTrailing"],
  setup(props: { text: string; isTrailing?: boolean }) {
    return () =>
      h(
        "span",
        { "data-slate-string": true },
        `${props.text ?? ""}${props.isTrailing ? "\n" : ""}`,
      );
  },
});

const ZeroWidthString = defineComponent({
  name: "slate-zero-width-string",
  props: ["length", "isMarkPlaceholder", "isLineBreak"],
  setup(props: {
    length?: number;
    isMarkPlaceholder?: boolean;
    isLineBreak?: boolean;
  }) {
    // FIXME: Inserting the \uFEFF on iOS breaks capitalization at the start of an
    // empty editor (https://github.com/ianstormtaylor/slate/issues/5199).
    //
    // However, not inserting the \uFEFF on iOS causes the editor to crash when
    // inserting any text using an IME at the start of a block. This appears to
    // be because accepting an IME suggestion when at the start of a block (no
    // preceding \uFEFF) removes one or more DOM elements that `toSlateRange`
    // depends on. (https://github.com/ianstormtaylor/slate/issues/5703)
    return () =>
      h(
        "span",
        {
          "data-slate-zero-width": props.isLineBreak ? "n" : "z",
          "data-slate-length": props.length,
          "data-slate-mark-placeholder": props.isMarkPlaceholder
            ? true
            : undefined,
        },
        [
          !IS_ANDROID || !props.isLineBreak ? "\uFEFF" : null,
          props.isLineBreak ? h("br") : null,
        ],
      );
  },
});
