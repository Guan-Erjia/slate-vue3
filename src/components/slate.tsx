import {
  createEditor,
  type Descendant,
  Editor,
  Node,
  Operation,
  Scrubber,
} from "slate";
import { withDOM, EDITOR_TO_ON_CHANGE } from "../slate-dom";
import { DOMEditor } from "../plugin/react-editor";
import { defineComponent, onMounted, onUnmounted, provide, ref, renderSlot } from "vue";
import { cloneDeep } from "lodash";

type EditorChangeHandler = (editor: Editor) => void;

export const Slate = defineComponent({
  name: 'slate-editor',
  props: {
    initialValue: {
      type: Array,
      default: () => [{ type: "paragraph", children: [{ text: "" }] }]
    },
  },
  setup(props: {
    initialValue: Descendant[];
  }, { emit, slots, expose }) {

    const editor = withDOM(createEditor())
    editor.children = props.initialValue;
    expose(editor)
    provide("editorRef", editor);
    const reactiveEditor = ref(editor)
    provide("reactiveEditor", reactiveEditor);

    const editorVersion = ref(0);
    provide("editorVersion", editorVersion);
    const editorIsFocus = ref(DOMEditor.isFocused(editor));
    const fn = () => editorIsFocus.value = DOMEditor.isFocused(editor)
    provide("editorIsFocus", editorIsFocus);

    const onContextChange = (options?: { operation?: Operation }) => {
      emit("change", editor.children);
      reactiveEditor.value.children = cloneDeep(editor.children);
      switch (options?.operation?.type) {
        case "set_selection":
          emit("selectionchange", editor.selection);
          break;
        default:
          emit("valuechange", editor.children);
      }
    };

    const eventListeners: EditorChangeHandler[] = []
    provide("addEventListener", (callback: EditorChangeHandler) => {
      eventListeners.push(callback);
      return () => {
        eventListeners.splice(eventListeners.indexOf(callback), 1);
      };
    });

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

      document.addEventListener("focusin", fn);
      document.addEventListener("focusout", fn);
      EDITOR_TO_ON_CHANGE.set(editor, onContextChange);
    });

    onUnmounted(() => {
      document.removeEventListener("focusin", fn);
      document.removeEventListener("focusout", fn);
      EDITOR_TO_ON_CHANGE.delete(editor);
    });

    return () => renderSlot(slots, 'default')
  },
})




