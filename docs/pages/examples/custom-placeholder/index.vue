<script setup lang="ts">
import { Slate, Editable, type RenderElementProps, type RenderPlaceholderProps } from "slate-vue3"
import { h } from "vue";
import { createEditor, Descendant } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  { type: 'paragraph', children: [{ text: '' }], }
]


const renderElement = ({ attributes, children }: RenderElementProps) => {
  return h('p', attributes, children)
}
const renderPlaceholder = ({ children, attributes }: RenderPlaceholderProps) => {
  return h('div', attributes,
    [
      h('p', null, children),
      h('pre', null, 'Use the renderPlaceholder prop to customize rendering of the placeholder')
    ])
}
const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue;
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement"
    :render-placeholder="renderPlaceholder">
    <Editable style="padding: 0;" placeholder="Type something" />
  </Slate>
</template>
