<template>
  <Button :active="isBlockActive" @click="onClick" @pointerdown="onPointerDown">
    {{ props.icon }}
  </Button>
</template>

<script setup lang="ts">
import { Editor, Node, Transforms } from "slate-vue3/core";
import { useEditor } from "slate-vue3";
import Button from "../../../components/Button.vue";
import { computed } from "vue";
import { CustomElement } from "../../../custom-types.js";
const editor = useEditor();
const props = defineProps<{
  icon: string;
  format: CustomElement["type"];
  depth?: number;
}>();

const isBlockActive = computed(() => {
  if (!editor.selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, editor.selection),
      match: (n) => {
        if (!Node.isElement(n)) {
          return false;
        }
        if (props.format === "heading" && typeof props.depth === "number") {
          return n.type === "heading" && n.depth === props.depth;
        }
        return n.type === props.format;
      },
    }),
  );

  return !!match;
});

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const onClick = () => {
  const isActive = isBlockActive.value;
  const isList = LIST_TYPES.includes(props.format);

  Transforms.unwrapNodes(editor, {
    match: (n) => Node.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  });
  const newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : props.format,
  };
  Transforms.setNodes(editor, { ...newProperties, depth: props.depth } as any);

  if (!isActive && isList) {
    const block = { type: props.format, children: [] };
    Transforms.wrapNodes(editor, block as any);
  }
};
const onPointerDown = (event: PointerEvent) => {
  event.preventDefault();
};
</script>
