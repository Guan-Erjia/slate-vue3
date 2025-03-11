<script setup lang="ts">
import { withDOM, Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withHistory } from "slate-vue3"
import { h } from "vue";
import type { Descendant, RenderElementProps } from "slate-vue3";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'This Editor is rendered within a nested Shadow DOM.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'This Editor is rendered within a nested Shadow DOM.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'This Editor is rendered within a nested Shadow DOM.' }],
  },
]

const renderElement = ({ attributes, children }: RenderElementProps) => {
  return h('p', attributes, children)
}
const editor = withHistory(withDOM(createEditor(initialValue)))
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>

<style>
[data-slate-editor]>*+* {
  margin-top: 12px;
}

[data-slate-placeholder] {
  margin-top: 0;
}
</style>
