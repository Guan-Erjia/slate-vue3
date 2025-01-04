<template>
  <slot></slot>
</template>
<script setup lang="ts">
import {
  type Descendant,
  Editor,
  Node,
  Operation,
  Scrubber,
  type Selection,
} from "slate";
import { EDITOR_TO_ON_CHANGE } from "slate-dom";
import { ReactEditor } from "../plugin/react-editor";
import { onMounted, onUnmounted, provide, ref } from "vue";

type EditorChangeHandler = (editor: Editor) => void;

const props = defineProps<{
  editor: ReactEditor;
  initialValue: Descendant[];
}>();
const emit = defineEmits<{
  change: [Descendant[]];
  selectionchange: [Selection];
  valuechange: [Descendant[]];
}>();

const { editor, initialValue, ...rest } = props;

const editorRef = ref<Editor>(editor);
const editorVersion = ref(0);
const editorIsFocus = ref(ReactEditor.isFocused(editor));
const eventListeners = ref<EditorChangeHandler[]>([]);

const handleSelectorChange = (editor: Editor) => {
  editorRef.value = editor;
  eventListeners.value.forEach((listener: EditorChangeHandler) =>
    listener(editor)
  );
};

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
  handleSelectorChange(editor);
};

provide("editorIsFocus", editorIsFocus);
provide("editorRef", editorRef);
provide("editorVersion", editorRef);
provide("addEventListener", (callback: EditorChangeHandler) => {
  eventListeners.value.push(callback);
  return () => {
    eventListeners.value.splice(eventListeners.value.indexOf(callback), 1);
  };
});

const focusCb = () => (editorIsFocus.value = ReactEditor.isFocused(editor));
onMounted(() => {
  if (!Node.isNodeList(initialValue)) {
    throw new Error(
      `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
        initialValue
      )}`
    );
  }
  if (!Editor.isEditor(editor)) {
    throw new Error(
      `[Slate] editor is invalid! You passed: ${Scrubber.stringify(editor)}`
    );
  }
  editor.children = initialValue;
  Object.assign(editor, rest);
  editorRef.value = editor;

  document.addEventListener("focusin", focusCb);
  document.addEventListener("focusout", focusCb);
  EDITOR_TO_ON_CHANGE.set(editor, onContextChange);
});

onUnmounted(() => {
  EDITOR_TO_ON_CHANGE.set(editor, () => {});
  document.removeEventListener("focusin", focusCb);
  document.removeEventListener("focusout", focusCb);
});
</script>
