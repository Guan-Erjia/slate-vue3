<template>
  <Slate :editor :render-leaf :decorate>
    <Editable />
  </Slate>
</template>
<script lang="ts" setup>
import { DecoratedRange, NodeEntry } from "slate-vue3/core";
import { DOMEditor } from "slate-vue3/dom";
import { Slate, Editable, RenderLeafProps } from "slate-vue3";
import { VNode } from "vue";

defineProps<{
  editor: DOMEditor;
  renderLeaf: (props: RenderLeafProps) => VNode;
  decorate: (entry: NodeEntry) => DecoratedRange[];
}>();
</script>
