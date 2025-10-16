<template>
  <Slate
    :editor
    :render-element
    @change="onChange"
    @selectionchange="onSelectionChange"
    @valuechange="onValueChange"
  >
    <Editable />
  </Slate>
</template>
<script lang="ts" setup>
import { DOMEditor } from "slate-dom";
import { Slate, Editable, RenderElementProps } from "slate-vue";
import { h } from "vue";

const props = defineProps<{
  editor: DOMEditor;
  onValueChange?: (value: any) => void;
  onChange?: (value: any) => void;
  onSelectionChange?: (value: any) => void;
  onRenderTracked?: () => void;
}>();

const renderElement = ({ attributes, children }: RenderElementProps) => {
  props.onRenderTracked?.();
  return h("p", attributes, children);
};
</script>
