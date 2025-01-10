<script setup lang="ts">
import { Slate } from "./components/slate";
import { Editable } from "./components/editable";
import { h, ref, } from "vue";
import { DOMEditor, IS_ANDROID } from "slate-dom";
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from "./components/interface";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  }, {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  }
];

const renderElement = ({ attributes, children, }: RenderElementProps) => {
  return h('p', attributes, children)
}

const renderLeaf = ({ attributes, children, }: RenderLeafProps) => {
  return h('span', attributes, children)
}

const renderPlaceHolder = ({ attributes, children }: RenderPlaceholderProps) => {
  return h('span', attributes, [
    children,
    IS_ANDROID ? h('br') : undefined
  ])
}
const editor = ref<DOMEditor>()

</script>

<template>
  <Slate :initial-value="initialValue" ref="editor">
    <Editable placeholder="Enter some rich text…" spellCheck autoFocus :render-element="renderElement"
      :render-leaf="renderLeaf" :render-placeholder="renderPlaceHolder" />
  </Slate>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
