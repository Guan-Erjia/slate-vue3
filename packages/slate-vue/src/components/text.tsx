import { type DecoratedRange, Editor, Text, Range, Element, Node } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  MARK_PLACEHOLDER_SYMBOL,
  NODE_TO_ELEMENT,
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
  props: ["text", "parent"],
  setup(props: TextProps) {
    const { text, parent } = props;
    const editor = useEditor();
    const spanRef = ref<HTMLSpanElement>();
    const decorate = useDecorate();

    const parentDecorations = computed<DecoratedRange[]>(() => {
      const path = DOMEditor.findPath(editor, props.parent);
      const range = Editor.range(editor, path);
      const ds = decorate([props.parent, path]);
      let parent = Editor.parent(editor, path);
      while (parent[1].length) {
        const parentDs = decorate(parent);
        parentDs.forEach((dec) => {
          ds.push(Range.intersection(dec, range)!);
        });
        parent = Editor.parent(editor, parent[1]);
      }

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
          ds.push({
            [MARK_PLACEHOLDER_SYMBOL]: true,
            ...unset,
            ...editor.marks,

            anchor,
            focus: anchor,
          });
        }
      }
      return ds;
    });

    const leaves = computed(() => {
      const path = DOMEditor.findPath(editor, text);
      const range = Editor.range(editor, path);
      const ds = decorate([text, path]);
      parentDecorations.value.forEach((dec) => {
        ds.push(Range.intersection(dec, range)!);
      });
      return Text.decorations(text, ds.filter(Boolean).length ? ds : []);
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
      const key = DOMEditor.findKey(editor, text);
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
      KEY_TO_ELEMENT?.delete(key);
      NODE_TO_ELEMENT.delete(text);
      if (spanRef.value) {
        ELEMENT_TO_NODE.delete(spanRef.value);
      }
    });

    return () => {
      const key = DOMEditor.findKey(editor, text);
      return h(
        "span",
        { "data-slate-node": "text", ref: spanRef },
        leaves.value.map((leaf, i) =>
          h(LeafComp, {
            text,
            parent,
            leaf,
            isLastIndex: i === leaves.value.length - 1,
            key: `${key.id}-${i}-${text.text}`,
          })
        )
      );
    };
  },
});
