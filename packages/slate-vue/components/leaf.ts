import { Text, LeafPosition } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from "slate-dom";
import { h, ref, computed, defineComponent, onMounted, onUnmounted } from "vue";
import { useEditor } from "../hooks/use-editor";
import { StringComp } from "./string";
import { usePlaceholderShow } from "../render/placeholder";
import { PlaceholderComp } from "./placeholder";
import { useRenderLeaf } from "../render/fn";

export const LeafComp = defineComponent({
  name: "slate-text",
  props: ["text", "leaf", "isLast", "leafPosition"],
  setup(props: {
    text: Text;
    leaf: Text;
    isLast: boolean;
    leafPosition?: LeafPosition;
  }) {
    const text = props.text;
    const leaf = props.leaf;
    const isLast = props.isLast;
    const leafPosition = props.leafPosition;
    const editor = useEditor();
    const textRef = ref<HTMLSpanElement>();

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

    const renderLeaf = useRenderLeaf();
    const showPlaceholder = usePlaceholderShow();

    const children = computed(() => {
      return showPlaceholder.value
        ? [
            h(StringComp, {
              text,
              leaf,
              isLast: true,
              key: DOMEditor.findKey(editor, leaf).id,
            }),
            h(PlaceholderComp),
          ]
        : h(StringComp, {
            text,
            leaf,
            isLast,
            key: DOMEditor.findKey(editor, leaf).id,
          });
    });

    return () =>
      renderLeaf({
        text,
        leaf,
        leafPosition,
        attributes: { "data-slate-leaf": true },
        children: children.value,
      });
  },
});
