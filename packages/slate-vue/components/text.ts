import { Editor, Text, Range } from "slate";
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
import { useEditor } from "../hooks/use-editor";
import { useMarkPlaceholder } from "../render/placeholder";
import { DEFAULT_DECORATE_FN } from "./utils";
import { injectDecorateFn, injectInnerElementDR } from "../render/decorate";
import { useRenderText } from "../render/fn";
import { LeafComp } from "./leaf";

export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "isLast"],
  setup(props: { text: Text; isLast: boolean }) {
    const text = props.text;
    const editor = useEditor();
    const textRef = ref<HTMLSpanElement>();
    const markPlaceholder = useMarkPlaceholder();

    const decorate = injectDecorateFn();
    const elementDR = injectInnerElementDR();
    const leaves = computed(() => {
      if (decorate === DEFAULT_DECORATE_FN) {
        return [{ leaf: text }];
      }
      const textPath = DOMEditor.findPath(editor, text);
      const textDs = decorate([text, textPath]);
      const range = Editor.range(editor, textPath);
      for (const dr of elementDR.value) {
        textDs.push(Range.intersection(dr, range)!);
      }
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

    const renderText = useRenderText();

    const children = computed(() =>
      renderList(leaves.value, (leaf, i) =>
        h(LeafComp, {
          text,
          leaf: leaf.leaf,
          isLast: props.isLast && i === leaves.value.length - 1,
          leafPosition: leaf.position,
          key: DOMEditor.findKey(editor, leaf.leaf).id,
        }),
      ),
    );

    return () =>
      renderText({
        text,
        attributes: { "data-slate-node": "text", ref: textRef },
        children: children.value,
      });
  },
});
