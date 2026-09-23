import { Text, DecoratedRange } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from "slate-vue3/dom";
import { h, ref, defineComponent, renderList, onUpdated, computed } from "vue";
import { useEditor } from "../hooks/use-editor";
import { useTextDecorations } from "../hooks/use-decorations";
import { useRenderText } from "../render/fn";
import { LeafComp } from "./leaf";
import { useEditorVersion } from "../render/version";
import { RenderTextProps } from "../utils/interface";

export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "isLast", "decorations"],
  setup(props: { text: Text; isLast: boolean; decorations: DecoratedRange[] }) {
    const editor = useEditor();
    const textRef = ref<HTMLSpanElement>();

    const renderText = useRenderText();
    const renderTextAttributes: RenderTextProps["attributes"] = {
      "data-slate-node": "text",
      ref: textRef,
    };

    const editorVersion = useEditorVersion();

    // Skip the forced re-render on the initial mount: there is no committed
    // DOM to restore the selection against yet, and forcing an extra render
    // here breaks contenteditable input in Firefox. Only later decoration
    // changes need to re-render Editable in the same batch as the text
    // components notified above, so its selection-restoration layout effect
    // runs after the decoration-induced DOM changes are committed. Without
    // that, the text components restructure the DOM in a separate pass where
    // Editable's layout effect never fires, potentially leaving the caret at
    // a wrong position.

    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
    const { decorations, update } = useTextDecorations(() => props.text);
    onUpdated(() => {
      editorVersion.value++;
      update();
    });
    const decoratedLeaves = computed(() =>
      Text.decorations(props.text, [
        ...props.decorations,
        ...decorations.value,
      ]),
    );

    return () => {
      const key = DOMEditor.findKey(editor, props.text);
      if (textRef.value && KEY_TO_ELEMENT) {
        KEY_TO_ELEMENT.set(key, textRef.value);
        ELEMENT_TO_NODE.set(textRef.value, props.text);
        NODE_TO_ELEMENT.set(props.text, textRef.value);
      }

      return renderText({
        text: props.text,
        attributes: renderTextAttributes,
        children: renderList(decoratedLeaves.value, (leaf, i) =>
          h(LeafComp, {
            text: props.text,
            leaf: leaf.leaf,
            isLast: props.isLast && i === decoratedLeaves.value.length - 1,
            leafPosition: leaf.position,
            key: `${props.text.text}-${leaf.position?.end}-${leaf.position?.start}`,
          }),
        ),
      });
    };
  },
});
