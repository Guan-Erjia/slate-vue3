import {
  createEditor,
  type Descendant,
  Editor,
  Node,
  Operation,
  Scrubber,
} from "slate";
import { EDITOR_TO_ON_CHANGE } from "../slate-dom";
import { DOMEditor } from "../plugin/react-editor";
import { defineComponent, onMounted, onUnmounted, provide, ref, renderSlot } from "vue";
import { withDOM } from "../slate-dom";

type EditorChangeHandler = (editor: Editor) => void;

export const Slate = defineComponent({
  name: 'Slate',
  props: {
    initialValue: {}
  },
  setup(props: {
    initialValue: Descendant[];
  }, { emit, slots, expose }) {

    const editor = withDOM(createEditor())
    editor.children = props.initialValue;
    expose(editor)

    const editorVersion = ref(0);
    const editorIsFocus = ref(DOMEditor.isFocused(editor));
    const eventListeners = ref<EditorChangeHandler[]>([]);

    const onContextChange = (options?: { operation?: Operation }) => {
      emit("change", editor.children);
      switch (options?.operation?.type) {
        case "set_selection":
          emit("selectionchange", editor.selection);
          break;
        default:
          emit("valuechange", editor.children);
      }

      editorVersion.value++;
    };


    provide("editorIsFocus", editorIsFocus);
    provide("editorRef", editor);
    provide("editorVersion", editorVersion);
    provide("addEventListener", (callback: EditorChangeHandler) => {
      eventListeners.value.push(callback);
      return () => {
        eventListeners.value.splice(eventListeners.value.indexOf(callback), 1);
      };
    });

    const focusCb = () => editorIsFocus.value = DOMEditor.isFocused(editor)
    onMounted(() => {
      if (!Node.isNodeList(props.initialValue)) {
        throw new Error(
          `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
            props.initialValue
          )}`
        );
      }
      if (!Editor.isEditor(editor)) {
        throw new Error(
          `[Slate] editor is invalid! You passed: ${Scrubber.stringify(editor)}`
        );
      }

      document.addEventListener("focusin", focusCb);
      document.addEventListener("focusout", focusCb);
      EDITOR_TO_ON_CHANGE.set(editor, onContextChange);
    });

    onUnmounted(() => {
      EDITOR_TO_ON_CHANGE.delete(editor);
      document.removeEventListener("focusin", focusCb);
      document.removeEventListener("focusout", focusCb);
    });

    return () => renderSlot(slots, 'default')
  },
})




