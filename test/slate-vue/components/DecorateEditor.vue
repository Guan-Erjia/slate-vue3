<template>
  <Slate :editor :render-leaf="props.renderLeaf" :decorate>
    <Editable />
  </Slate>
</template>
<script lang="ts" setup>
import { DecoratedRange, NodeEntry } from "slate";
import { DOMEditor } from "slate-dom";
import { Slate, Editable, RenderLeafProps } from "slate-vue";
import { VNode } from "vue";

const props = defineProps<{
  editor: DOMEditor;
  renderLeaf: (props: RenderLeafProps) => VNode;
  decorate: (entry: NodeEntry) => DecoratedRange[];
}>();
</script>
