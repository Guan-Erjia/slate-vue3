<template>
  <Teleport to="body">
    <div
      ref="menuRef"
      data-testid="menu"
      :style="menuStyle"
      @mousedown="onMouseDown"
    >
      <Button
        :reversed="true"
        @click="toggleMark('bold', $event)"
        :active="isMarkActive('bold')"
        >format_bold</Button
      >
      <Button
        :reversed="true"
        @click="toggleMark('italic', $event)"
        :active="isMarkActive('italic')"
        >format_italic</Button
      >
      <Button
        style="margin-right: 0"
        :reversed="true"
        @click="toggleMark('underlined', $event)"
        :active="isMarkActive('underlined')"
        >format_underlined</Button
      >
    </div>
  </Teleport>
</template>
<script lang="ts" setup>
import { useEditor, useFocused } from "slate-vue3";
import { Editor, Range } from "slate-vue3/core";
import { computed, CSSProperties, ref } from "vue";
import Button from "../../../components/Button.vue";
const menuRef = ref<HTMLDivElement>();

const editor = useEditor();
const inFocus = useFocused();

const isMarkActive = (format: "bold" | "italic" | "underlined") => {
  const marks: any = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};
const toggleMark = (format: "bold" | "italic" | "underlined", event: Event) => {
  event.preventDefault();
  const isActive = isMarkActive(format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const onMouseDown = (e: Event) => {
  e.preventDefault();
};

const menuStyle = computed(() => {
  const style: CSSProperties = {
    padding: "8px 7px 6px",
    position: "absolute",
    zIndex: 1,
    top: "-10000",
    left: "-10000",
    display: "block",
    marginTop: "-6px",
    opacity: 0,
    backgroundColor: "#222",
    borderRadius: "4px",
    transition: "opacity 0.75s",
    lineHeight: 1,
  };
  const selection = editor.selection;
  const domSelection = window.getSelection();
  if (
    !selection ||
    !inFocus.value ||
    Range.isCollapsed(selection) ||
    Editor.string(editor, selection) === ""
  ) {
    style.display = "none";
  } else if (!domSelection) {
    style.display = "none";
  } else {
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    if (menuRef.value) {
      style.opacity = 1;
      style.top = `${rect.top + window.pageYOffset - menuRef.value.offsetHeight}px`;
      style.left = `${rect.left + window.pageXOffset - menuRef.value.offsetWidth / 2 + rect.width / 2}px`;
    }
  }
  return style;
});
</script>
