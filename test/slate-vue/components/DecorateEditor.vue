<template>
  <Slate :editor :render-leaf :decorate>
    <Editable />
  </Slate>
</template>
<script lang="ts" setup>
import { DecoratedRange, NodeEntry } from "slate";
import { DOMEditor } from "slate-dom";
import { Slate, Editable, RenderLeafProps } from "slate-vue";
import { VNode } from "vue";

defineProps<{
  editor: DOMEditor;
  renderLeaf: (props: RenderLeafProps) => VNode;
  decorate: (entry: NodeEntry) => DecoratedRange[];
}>();
</script>
