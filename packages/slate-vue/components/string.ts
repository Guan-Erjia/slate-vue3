import { Editor, Path, Node, Element, Text } from "slate";
import {
  IS_ANDROID,
  IS_IOS,
  DOMEditor,
  MARK_PLACEHOLDER_SYMBOL,
} from "slate-dom";
import { computed, defineComponent, h } from "vue";
import { useEditor } from "../hooks/use-editor";

export const StringComp = defineComponent({
  name: "slate-string",
  props: ["isLast", "leaf", "element", "text"],
  setup(props: {
    isLast: boolean;
    text: Text;
    leaf: Text;
    element: Element;
  }) {
    const { isLast, leaf, element, text } = props;
    const editor = useEditor();

    const getTextContent = computed(() => {
      const text = leaf.text
      return (text ?? "") + (isLast && text.at(-1) === "\n" ? "\n" : "")
    });


    // COMPAT: If this is the last text node in an empty block, render a zero-
    // width space that will convert into a line break when copying and pasting
    // to support expected plain text.
    const isLineBreak = computed(() => {
      const pathParent = Path.parent(DOMEditor.findPath(editor, text));
      return (
        leaf.text === "" &&
        element.children[element.children.length - 1] === text &&
        !editor.isInline(element) &&
        Editor.string(editor, pathParent) === ""
      );
    });

    const zeroStringAttrs = computed(() => {
      const length = Node.string(element).length || 0
      const isMarkPlaceholder = Boolean(leaf[MARK_PLACEHOLDER_SYMBOL]) || false
      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.
      const isVoidParent = editor.isVoid(element)
      if (isVoidParent || isLineBreak.value || leaf.text === '') {
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

