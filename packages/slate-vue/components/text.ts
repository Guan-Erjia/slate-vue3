import { Editor, Text, Range } from "slate-vue3/core";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from "slate-vue3/dom";
import {
  h,
  ref,
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  renderList,
  onUpdated,
} from "vue";
import { useEditor } from "../hooks/use-editor";
import { useMarkPlaceholder } from "../render/placeholder";
import { DEFAULT_DECORATE_FN } from "./utils";
import { injectDecorateFn, injectInnerElementDR } from "../render/decorate";
import { useRenderText } from "../render/fn";
import { LeafComp } from "./leaf";
import { useEditorVersion } from "../render/version";
import { RenderTextProps } from "../utils/interface";

export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "isLast"],
  setup(props: { text: Text; isLast: boolean }) {
    const text = props.text;
    const editor = useEditor();
    const textRef = ref<HTMLSpanElement>();

    const decorate = injectDecorateFn();
    const needDecorate = decorate !== DEFAULT_DECORATE_FN;

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
    const renderTextAttributes: RenderTextProps["attributes"] = {
      "data-slate-node": "text",
      ref: textRef,
    };
    if (!needDecorate) {
      return () =>
        renderText({
          text,
          attributes: renderTextAttributes,
          children: [
            h(LeafComp, {
              text,
              leaf: text,
              isLast: props.isLast,
            }),
          ],
        });
    }

    const markPlaceholder = useMarkPlaceholder();
    const editorVersion = useEditorVersion();

    const elementDR = injectInnerElementDR();
    const leaves = computed(() => {
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

    // Skip the forced re-render on the initial mount: there is no committed
    // DOM to restore the selection against yet, and forcing an extra render
    // here breaks contenteditable input in Firefox. Only later decoration
    // changes need to re-render Editable in the same batch as the text
    // components notified above, so its selection-restoration layout effect
    // runs after the decoration-induced DOM changes are committed. Without
    // that, the text components restructure the DOM in a separate pass where
    // Editable's layout effect never fires, potentially leaving the caret at
    // a wrong position.
    onUpdated(() => editorVersion.value++);

    let key = 0;
    const children = computed(() =>
      renderList(leaves.value, (leaf, i) =>
        h(LeafComp, {
          text,
          leaf: leaf.leaf,
          isLast: props.isLast && i === leaves.value.length - 1,
          leafPosition: leaf.position,
          key: key++,
        }),
      ),
    );

    return () =>
      renderText({
        text,
        attributes: renderTextAttributes,
        children: children.value,
      });
  },
});
