<template>
  <Slate :editor :render-leaf>
    <Editable placeholder="Enter some text…" spellcheck />
  </Slate>
</template>
<script lang="ts" setup>
import {
  Slate,
  Editable,
  RenderLeafProps,
  createReactiveEditor,
} from "slate-vue3";
import { Descendant } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";
import { h } from "vue";

const props = defineProps<{
  value: Descendant[];
}>();

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    return h("span", attributes, h("strong", children));
  }
  return h("span", attributes, children);
};
const editor = withHistory(createReactiveEditor());
editor.children = props.value;
</script>
