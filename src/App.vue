<script setup lang="ts">
import { Slate } from "./components/slate";
import { Editable } from "./components/editable";
import { h, } from "vue";
import { IS_ANDROID, withDOM } from "slate-dom";
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from "./components/interface";
import { createEditor } from "slate";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "1 2 3 4 5 6 7 8  9 0 " }],
  }, {
    type: "paragraph",
    children: [{ text: "a b c d e f g h i j k l m n o p q r s t u v w x y z" }],
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

const editor = withDOM(createEditor(initialValue))
</script>

<template>
  <Slate :editor="editor">
    <Editable style="border: 1px solid red;padding: 10px;" placeholder="Enter some rich text…" spellCheck autoFocus
      :render-element="renderElement" :render-leaf="renderLeaf" :render-placeholder="renderPlaceHolder" />
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
