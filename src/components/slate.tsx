import { defineComponent, onMounted, onUnmounted, provide, ref, renderSlot } from "vue";
import { SLATE_CHANGE_EFFECT_INJECT, SLATE_INITIAL_VALUE, SLATE_USE_EDITOR } from "../constants";
import { createEditor, Node, Operation, Scrubber } from "slate";
import { SlateProps } from "./interface";
import { DOMEditor, EDITOR_TO_ON_CHANGE, withDOM } from "slate-dom";


export const Slate = defineComponent({
  name: 'slate-editor',
  props: {
    initialValue: {
      type: Array,
      require: true
    },
  },
  setup(props: SlateProps, { slots, emit }) {

    if (!Node.isNodeList(props.initialValue)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          props.initialValue
        )}`
      );
    }
    const editor = withDOM(createEditor(props.initialValue))
    provide(SLATE_USE_EDITOR, editor)
    provide(SLATE_INITIAL_VALUE, props.initialValue)



    const editorIsFocus = ref(DOMEditor.isFocused(editor));
    const fn = () => editorIsFocus.value = DOMEditor.isFocused(editor)

    let changeEffect = () => { }
    provide(SLATE_CHANGE_EFFECT_INJECT, (fn: () => void) => changeEffect = fn)
    onMounted(() => {
      document.addEventListener("focusin", fn);
      document.addEventListener("focusout", fn);
      EDITOR_TO_ON_CHANGE.set(editor, (options?: { operation?: Operation }) => {
        emit("change", editor.children);
        changeEffect()
        switch (options?.operation?.type) {
          case "set_selection":
            emit("selectionchange", editor.selection);
            break;
          default:
            emit("valuechange", editor.children);
        }
      });
    });

    onUnmounted(() => {
      document.removeEventListener("focusin", fn);
      document.removeEventListener("focusout", fn);
      EDITOR_TO_ON_CHANGE.delete(editor);
    });
    return () => renderSlot(slots, 'default')
  },
})




