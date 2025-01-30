import { Editor, Path, Node } from "slate";
import {
  IS_ANDROID,
  IS_IOS,
  DOMEditor,
  MARK_PLACEHOLDER_SYMBOL,
} from "slate-dom";
import { computed, defineComponent, h } from "vue";
import type { StringProps } from "./interface";
import { useEditor } from "../hooks/use-editor";

/**
 * Leaf content strings.
 */
export const StringComp = defineComponent({
  name: "slate-string",
  props: ["isLast", "leaf", "parent", "text"],
  setup(props: StringProps) {
    const { isLast, leaf, parent, text } = props;
    const editor = useEditor();

    const isMarkPlaceholder = computed(() =>
      Boolean(leaf[MARK_PLACEHOLDER_SYMBOL])
    );
    const getTextContent = computed(
      () =>
        (leaf.text ?? "") + (isLast && leaf.text.slice(-1) === "\n" ? "\n" : "")
    );

    // COMPAT: Render text inside void nodes with a zero-width space.
    // So the node can contain selection but the text is not visible.
    const isVoidParent = computed(() => editor.isVoid(parent));
    // COMPAT: If this is the last text node in an empty block, render a zero-
    // width space that will convert into a line break when copying and pasting
    // to support expected plain text.
    const isInlineBreak = computed(() => {
      const pathParent = Path.parent(DOMEditor.findPath(editor, text));
      return (
        leaf.text === "" &&
        parent.children[parent.children.length - 1] === text &&
        !editor.isInline(parent) &&
        Editor.string(editor, pathParent) === ""
      );
    });

    return () =>
      isVoidParent.value
        ? h(ZeroWidthString, { length: Node.string(parent).length })
        : isInlineBreak.value
        ? h(ZeroWidthString, {
            isLineBreak: true,
            isMarkPlaceholder: isMarkPlaceholder.value,
          })
        : // COMPAT: If the text is empty, it's because it's on the edge of an inline
        // node, so we render a zero-width space so that the selection can be
        // inserted next to it still.
        leaf.text === ""
        ? h(ZeroWidthString, { isMarkPlaceholder: isMarkPlaceholder.value })
        : h("span", { "data-slate-string": true }, getTextContent.value);
  },
});

/**
 * Leaf strings without text, render as zero-width strings.
 */

export const ZeroWidthString = defineComponent({
  props: {
    length: {},
    isLineBreak: {},
    isMarkPlaceholder: {},
  },
  setup(props: {
    length?: number;
    isLineBreak?: boolean;
    isMarkPlaceholder?: boolean;
  }) {
    const {
      length = 0,
      isLineBreak = false,
      isMarkPlaceholder = false,
    } = props;

    const attributes = computed<{
      "data-slate-zero-width": string;
      "data-slate-length": number;
      "data-slate-mark-placeholder"?: boolean;
    }>(() => ({
      "data-slate-zero-width": isLineBreak ? "n" : "z",
      "data-slate-length": length,
      "data-slate-mark-placeholder": isMarkPlaceholder ? true : undefined,
    }));

    return () => (
      <span {...attributes.value}>
        {!(IS_ANDROID || IS_IOS) || !isLineBreak ? "\uFEFF" : null}
        {isLineBreak ? <br /> : null}
      </span>
    );
  },
});
