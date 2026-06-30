<template>
  <Button :active="isAlignActive" @click="onClick" @pointerdown="onPointerDown">
    {{ props.icon }}
  </Button>
</template>

<script setup lang="ts">
import { Editor, Node, Transforms } from "slate-vue3/core";
import { useEditor } from "slate-vue3";
import Button from "../../../components/Button.vue";
import { computed } from "vue";
const editor = useEditor();
const props = defineProps<{
  icon: string;
  direction: "left" | "center" | "right" | "justify";
}>();

const isAlignActive = computed(() => {
  if (!editor.selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, editor.selection),
      match: (n) => {
        return Node.isElement(n) && "align" in n && n.align === props.direction;
      },
    }),
  );

  return !!match;
});

const onClick = () => {
  Transforms.setNodes(editor, {
    align: isAlignActive.value ? undefined : props.direction,
  });
};
const onPointerDown = (event: PointerEvent) => {
  event.preventDefault();
};
</script>
