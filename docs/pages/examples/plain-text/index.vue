<script setup lang="ts">
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, type RenderElementProps } from "slate-vue3"
import { h } from "vue";
import { createEditor, Descendant } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable plain text, just like a <textarea>!' },
    ],
  }
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
