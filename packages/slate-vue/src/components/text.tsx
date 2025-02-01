import { type DecoratedRange, Editor, Text, Range, Element } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
} from "slate-dom";
import { LeafComp } from "./leaf";
import type { TextProps } from "./interface";
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { useDecorate } from "../hooks/use-decorate";
import { useEditor } from "../hooks/use-editor";

/**
 * Text.
 */
export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "parent", "parentDecorations"],
  setup(props: TextProps) {
    const { text, parent, parentDecorations } = props;
    const editor = useEditor();
    const spanRef = ref<HTMLSpanElement>();
    const decorate = useDecorate();

    const leaves = computed(() => {
      const thisPath = DOMEditor.findPath(editor, text);
      const range = Editor.range(editor, thisPath);
      const ds = decorate([text, thisPath]);
      parentDecorations.value.forEach((dec) => {
        ds.push(Range.intersection(dec, range)!);
      });
      return Text.decorations(text, ds.filter(Boolean).length ? ds : []);
    });

    const key = DOMEditor.findKey(editor, text);
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
      const key = DOMEditor.findKey(editor, text);
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
      KEY_TO_ELEMENT?.delete(key);
      NODE_TO_ELEMENT.delete(text);
      if (spanRef.value) {
        ELEMENT_TO_NODE.delete(spanRef.value);
      }
    });

    return () =>
      h(
        "span",
        { "data-slate-node": "text", ref: spanRef },
        leaves.value.map((leaf, i) =>
          h(LeafComp, {
            text,
            parent,
            leafIndex: i,
            leaves,
            key: `${key.id}-${i}`,
          })
        )
      );
  },
});
