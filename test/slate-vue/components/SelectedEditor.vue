<template>
  <Slate :editor :render-element>
    <Editable />
  </Slate>
</template>
<script lang="ts" setup>
import { DOMEditor } from "slate-vue3/dom";
import { Slate, Editable, RenderElementProps } from "slate-vue3";
import { VNode } from "vue";

defineProps<{
  editor: DOMEditor;
  renderElement: (props: RenderElementProps) => VNode;
}>();
</script>
