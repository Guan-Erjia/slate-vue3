import { Editor, Text, Range, Element, DecoratedRange, Node } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  MARK_PLACEHOLDER_SYMBOL,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
} from "slate-dom";
import {
  h,
  ref,
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  renderList,
} from "vue";
import { useDecorate } from "../hooks/use-decorate";
import { useEditor } from "../hooks/use-editor";
import { StringComp } from "./string";
import {
  useParentDescoration,
  useRenderLeaf,
  useMarkPlaceholder,
  useRenderText,
  usePlaceholderShow,
} from "../hooks/use-render";
import { PlaceholderComp } from "./placeholder";
import { useDecorations } from "../hooks/use-decorations";

export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "element"],
  setup(props: { text: Text; element: Element }) {
    const { text, element } = props;
    const editor = useEditor();
    const spanRef = ref<HTMLSpanElement>();
    const { decorate } = useDecorate();
    const markPlaceholder = useMarkPlaceholder();

    const parentDs = useParentDescoration();
    const decorations = useDecorations(text, parentDs);

    const leaves = computed(() => {
      const path = DOMEditor.findPath(editor, text);
      const range = Editor.range(editor, path);
      const ds = decorate([text, path]);
      decorations.value.forEach((dec) => {
        ds.push(Range.intersection(dec, range)!);
      });
      if (markPlaceholder.value) {
        ds.unshift(markPlaceholder.value);
      }
      const filterDs = ds.filter(Boolean);
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
    const renderText = useRenderText();
    const showPlaceholder = usePlaceholderShow();

    return () =>
      renderText({
        text,
        attributes: { "data-slate-node": "text", ref: spanRef },
        children: renderList(leaves.value, (leaf, i) =>
          renderLeaf({
            text,
            leaf: leaf.leaf,
            leafPosition: leaf.position,
            attributes: { "data-slate-leaf": true },
            children: [
              h(StringComp, {
                text,
                element,
                leaf: leaf.leaf,
                isLast: isLastText.value && i === leaves.value.length - 1,
                key: `${text.text}-${leaf.leaf.text}-${i}`,
              }),
              showPlaceholder.value && h(PlaceholderComp),
            ],
          })
        ),
      });
  },
});
