<script setup lang="ts">
import { withDOM, Slate, Editable, defaultRenderLeaf, createEditor, withHistory } from "slate-vue"
import { h } from "vue";
import type { Descendant, RenderElementProps, RenderPlaceholderProps } from "slate-vue";

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
const editor = withHistory(withDOM(createEditor(initialValue))) 
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="renderPlaceholder">
    <Editable style="padding: 0;" placeholder="Type something" />
  </Slate>
</template>
