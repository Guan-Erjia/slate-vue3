import { type DecoratedRange, Editor, Text, Range, Element, Node } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  MARK_PLACEHOLDER_SYMBOL,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
} from "slate-dom";
import {
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  renderList,
} from "vue";
import { useDecorate } from "../hooks/use-decorate";
import { useEditor } from "../hooks/use-editor";
import { StringComp } from "./string";
import { useRenderLeaf } from "../hooks/use-render";

export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "element"],
  setup(props: {
    element: Element;
    text: Text;
  }) {
    const { text, element } = props;
    const editor = useEditor();
    const spanRef = ref<HTMLSpanElement>();
    const decorate = useDecorate();

    const leaves = computed(() => {
      const elemPath = DOMEditor.findPath(editor, element);
      const elemDs = decorate([element, elemPath]);
      if (
        editor.selection &&
        Range.isCollapsed(editor.selection) &&
        editor.marks
      ) {
        const anchor = editor.selection.anchor;
        const leaf = Node.leaf(editor, anchor.path);
        const { text, ...rest } = leaf;
        // While marks isn't a 'complete' text, we can still use loose Text.equals
        // here which only compares marks anyway.
        if (!Text.equals(leaf, editor.marks as Text, { loose: true })) {
          const unset = Object.fromEntries(
            Object.keys(rest).map((mark) => [mark, null])
          );
          elemDs.push({
            [MARK_PLACEHOLDER_SYMBOL]: true,
            ...unset,
            ...editor.marks,

            anchor,
            focus: anchor,
          });
        }
      }

      const textPath = DOMEditor.findPath(editor, text);
      const range = Editor.range(editor, textPath);
      const textDs = decorate([text, textPath]);
      elemDs.forEach((dec) => {
        textDs.push(Range.intersection(dec, range)!);
      });
      const filterDs = textDs.filter(Boolean);
      return Text.decorations(text, filterDs.length ? filterDs : []);
    });

    onMounted(() => {
      const key = DOMEditor.findKey(editor, text);
      if (spanRef.value) {
        const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
        KEY_TO_ELEMENT?.set(key, spanRef.value);
        ELEMENT_TO_NODE.set(spanRef.value, text);
        NODE_TO_ELEMENT.set(text, spanRef.value);
      }
    });

    onUnmounted(() => {
      NODE_TO_ELEMENT.delete(text);
      if (spanRef.value) {
        ELEMENT_TO_NODE.delete(spanRef.value);
      }
    });

    const isLastText = computed(() => {
      const isVoid = Editor.isVoid(editor, element);
      const isLeafBlock =
        Element.isElement(element) &&
        !editor.isInline(element) &&
        Editor.hasInlines(editor, element);

      return (
        !isVoid &&
        isLeafBlock &&
        NODE_TO_INDEX.get(text) === element.children.length - 1
      );
    });

    const renderLeaf = useRenderLeaf();

    return () =>
      h(
        "span",
        { "data-slate-node": "text", ref: spanRef },
        renderList(leaves.value, (leaf, i) =>
          renderLeaf({
            text,
            leaf,
            attributes: { "data-slate-leaf": true },
            children: h(StringComp, {
              isLast: isLastText.value && i === leaves.value.length - 1,
              leaf,
              element,
              text,
              key: `${text.text}-${leaf.text}-${i}`,
            }),
          })
        )
      );
  },
});
