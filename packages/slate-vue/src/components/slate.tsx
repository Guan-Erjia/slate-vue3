import { computed, defineComponent, onMounted, onUnmounted, provide, ref, renderSlot, } from "vue";
import { SLATE_CHANGE_EFFECT_INJECT, SLATE_STATE_COMPOSING, SLATE_STATE_FOCUS, SLATE_STATE_READ_ONLY, SLATE_STATE_SELECTION, SLATE_USE_DECORATE, SLATE_USE_EDITOR } from "../utils/constants";
import { Node, Operation, Scrubber } from "slate";
import type { SlateProps } from "./interface";
import { DOMEditor, EDITOR_TO_ON_CHANGE } from "slate-dom";


export const Slate = defineComponent({
  name: 'slate-editor',
  props: {
    editor: {
      type: Object,
      require: true
    },
    decorate: {
      type: Function,
      default: () => []
    }
  },
  setup(props: SlateProps, { slots, emit, }) {
    const { editor, decorate} = props
    if (!Node.isNodeList(editor.children)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          editor.children
        )}`
      );
    }
    provide(SLATE_USE_EDITOR, editor)
    provide(SLATE_USE_DECORATE, decorate)

    const isFocus = ref(DOMEditor.isFocused(editor));
    const isComposing = ref(false);
    const isReadOnly = ref(false);
    const selection = computed(() => editor.selection)
    provide(SLATE_STATE_FOCUS, isFocus)
    provide(SLATE_STATE_COMPOSING, isComposing)
    provide(SLATE_STATE_READ_ONLY, isReadOnly)
    provide(SLATE_STATE_SELECTION, selection)

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




