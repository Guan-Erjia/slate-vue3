import { defineComponent, onMounted, onUnmounted, provide, ref, renderSlot, } from "vue";
import { SLATE_CHANGE_EFFECT_INJECT, SLATE_STATE_COMPOSING, SLATE_STATE_FOCUS, SLATE_STATE_READ_ONLY, SLATE_USE_EDITOR } from "../constants";
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

    const isFocus = ref(DOMEditor.isFocused(editor));
    const isComposing = ref(false);
    const isReadOnly = ref(false);
    provide(SLATE_STATE_FOCUS, isFocus)
    provide(SLATE_STATE_COMPOSING, isComposing)
    provide(SLATE_STATE_READ_ONLY, isReadOnly)

    const focusCb = () => isFocus.value = DOMEditor.isFocused(editor)
    let changeEffect = () => { }
    provide(SLATE_CHANGE_EFFECT_INJECT, (fn: () => void) => changeEffect = fn)
    onMounted(() => {
      document.addEventListener("focusin", focusCb);
      document.addEventListener("focusout", focusCb);
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
      document.removeEventListener("focusin", focusCb);
      document.removeEventListener("focusout", focusCb);
      EDITOR_TO_ON_CHANGE.delete(editor);
    });
    return () => renderSlot(slots, 'default')
  },
})




