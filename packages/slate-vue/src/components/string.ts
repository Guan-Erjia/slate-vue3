import { Editor, Path, Node } from "slate";
import {
  IS_ANDROID,
  IS_IOS,
  DOMEditor,
  MARK_PLACEHOLDER_SYMBOL,
} from "slate-dom";
import { computed, defineComponent, h } from "vue";
import type { StringProps } from "../utils/interface";
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

    const getTextContent = computed(() => {
      const text = leaf.value.text
      return (text ?? "") + (isLast.value && text.at(-1) === "\n" ? "\n" : "")
    });


    // COMPAT: If this is the last text node in an empty block, render a zero-
    // width space that will convert into a line break when copying and pasting
    // to support expected plain text.
    const isLineBreak = computed(() => {
      const pathParent = Path.parent(DOMEditor.findPath(editor, text));
      return (
        leaf.value.text === "" &&
        parent.children[parent.children.length - 1] === text &&
        !editor.isInline(parent) &&
        Editor.string(editor, pathParent) === ""
      );
    });

    const zeroStringAttrs = computed(() => {
      const length = Node.string(parent).length || 0
      const isMarkPlaceholder = Boolean((leaf.value as any)[MARK_PLACEHOLDER_SYMBOL]) || false
      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.
      const isVoidParent = editor.isVoid(parent)
      if (isVoidParent || isLineBreak.value || leaf.value.text === '') {
        return {
          "data-slate-zero-width": isLineBreak.value ? "n" : "z",
          "data-slate-length": length,
          "data-slate-mark-placeholder": isMarkPlaceholder ? true : undefined,
        }
      }
      return null
    })

    return () => zeroStringAttrs.value ?
      h('span', zeroStringAttrs.value, [
        !(IS_ANDROID || IS_IOS) || !isLineBreak.value ? "\uFEFF" : null,
        isLineBreak.value ? h('br') : null
      ])
      : h("span", { "data-slate-string": true }, getTextContent.value);
  },
});

