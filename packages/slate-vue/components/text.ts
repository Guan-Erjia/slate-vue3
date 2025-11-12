import { Editor, Text, Range, Element } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
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
import { useDecorate } from "../hooks/use-render";
import { useEditor } from "../hooks/use-editor";
import { StringComp } from "./string";
import {
  useRenderLeaf,
  useMarkPlaceholder,
  useRenderText,
  usePlaceholderShow,
} from "../hooks/use-render";
import { DEFAULT_DECORATE_FN } from "./utils";
import { PlaceholderComp } from "./placeholder";

export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "element"],
  setup(props: { text: Text; element: Element }) {
    const { text, element } = props;
    const editor = useEditor();
    const textRef = ref<HTMLSpanElement>();
    const decorate = useDecorate();
    const markPlaceholder = useMarkPlaceholder();

    const leaves = computed(() => {
      if (decorate === DEFAULT_DECORATE_FN) {
        return [{ leaf: text }];
      }
      const elemPath = DOMEditor.findPath(editor, element);
      const textPath = DOMEditor.findPath(editor, text);
      const textDs = decorate([text, textPath]);
      const elemDs = decorate([element, elemPath]);
      const range = Editor.range(editor, textPath);
      elemDs.forEach((dec) => {
        textDs.push(Range.intersection(dec, range)!);
      });
      if (markPlaceholder.value) {
        textDs.unshift(markPlaceholder.value);
      }
      const filterDs = textDs.filter(Boolean);
      return Text.decorations(text, filterDs.length ? filterDs : []);
    });

    onMounted(() => {
      const key = DOMEditor.findKey(editor, text);
      if (textRef.value) {
        const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
        KEY_TO_ELEMENT?.set(key, textRef.value);
        ELEMENT_TO_NODE.set(textRef.value, text);
        NODE_TO_ELEMENT.set(text, textRef.value);
      }
    });

    onUnmounted(() => {
      NODE_TO_ELEMENT.delete(text);
      if (textRef.value) {
        ELEMENT_TO_NODE.delete(textRef.value);
      }
    });

    const isLastText = computed(() => {
      if (Editor.isVoid(editor, element)) {
        return false;
      }
      if (!Element.isElement(element)) {
        return false;
      }
      if (editor.isInline(element)) {
        return false;
      }
      if (!Editor.hasInlines(editor, element)) {
        return false;
      }
      return NODE_TO_INDEX.get(text) === element.children.length - 1;
    });

    const renderLeaf = useRenderLeaf();
    const renderText = useRenderText();
    const showPlaceholder = usePlaceholderShow();

    return () =>
      renderText({
        text,
        attributes: { "data-slate-node": "text", ref: textRef },
        children: renderList(leaves.value, (leaf, i) =>
          renderLeaf({
            text,
            leaf: leaf.leaf,
            leafPosition: leaf.position,
            attributes: { "data-slate-leaf": true },
            children: showPlaceholder.value
              ? [
                  h(StringComp, {
                    text,
                    element,
                    leaf: leaf.leaf,
                    isLast: true,
                    key: DOMEditor.findKey(editor, leaf.leaf).id,
                  }),
                  h(PlaceholderComp),
                ]
              : h(StringComp, {
                  text,
                  element,
                  leaf: leaf.leaf,
                  isLast: isLastText.value && i === leaves.value.length - 1,
                  key: DOMEditor.findKey(editor, leaf.leaf).id,
                }),
          }),
        ),
      });
  },
});
