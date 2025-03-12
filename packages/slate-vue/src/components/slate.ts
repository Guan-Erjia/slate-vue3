import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
  renderSlot,
} from "vue";
import {
  SLATE_INNER_CHANGE_EFFECT_INJECT,
  SLATE_INNER_RENDER_ELEMENT,
  SLATE_INNER_RENDER_LEAF,
  SLATE_INNER_RENDER_PLACEHOLDER,
  SLATE_STATE_COMPOSING,
  SLATE_STATE_FOCUS,
  SLATE_STATE_READ_ONLY,
  SLATE_STATE_SELECTION,
  SLATE_USE_DECORATE,
  SLATE_USE_EDITOR,
} from "../utils/constants";
import { Node, Operation, Scrubber } from "slate";
import type { SlateProps } from "../utils/interface";
import { DOMEditor, EDITOR_TO_ON_CHANGE } from "slate-dom";

export const Slate = defineComponent({
  name: "slate-editor",
  emits: ["change", "selectionchange", "valuechange"],
  props: {
    editor: {
      type: Object,
      require: true,
    },
    decorate: {
      type: Function,
      default: () => [],
    },
    renderElement: {
      type: Function,
      required: true,
    },
    renderLeaf: {
      type: Function,
      required: true,
    },
    renderPlaceholder: {
      type: Function,
      required: true,
    },
  },
  setup(props: SlateProps, { slots, emit }) {
    const { editor, decorate, renderElement, renderLeaf, renderPlaceholder } =
      props;
    if (!Node.isNodeList(editor.children)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          editor.children
        )}`
      );
    }
    provide(SLATE_USE_EDITOR, editor);
    provide(SLATE_USE_DECORATE, decorate);
    provide(SLATE_INNER_RENDER_ELEMENT, renderElement);
    provide(SLATE_INNER_RENDER_LEAF, renderLeaf);
    provide(SLATE_INNER_RENDER_PLACEHOLDER, renderPlaceholder);

    const isFocus = ref(DOMEditor.isFocused(editor));
    const selection = computed(() => editor.selection);
    provide(SLATE_STATE_FOCUS, isFocus);

    // 只用作上下文分享，在editable.tsx组件中修改 value
    provide(SLATE_STATE_COMPOSING, ref(false));
    provide(SLATE_STATE_READ_ONLY, ref(false));
    provide(SLATE_STATE_SELECTION, selection);

    const focusCb = () => (isFocus.value = DOMEditor.isFocused(editor));

    // 记数用，触发 changeEffect
    const changeEffect = ref(0);
    provide(SLATE_INNER_CHANGE_EFFECT_INJECT, changeEffect);

    onMounted(() => {
      document.addEventListener("focusin", focusCb);
      document.addEventListener("focusout", focusCb);
      EDITOR_TO_ON_CHANGE.set(editor, (options?: { operation?: Operation }) => {
        emit("change", editor.children);
        changeEffect.value++;
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

    return () => renderSlot(slots, "default");
  },
});
