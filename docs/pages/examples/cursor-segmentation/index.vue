<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, type RenderElementProps, RenderLeafProps } from "slate-vue3"
import { h } from "vue";
import { createEditor, Descendant, NodeEntry, DecoratedRange, Text,  Path } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'The front and back of the cursor will have two colors' }]
  },
  {
    type: 'paragraph',
    children: [{ text: 'The front and back of the cursor will have two colors' }]
  },
  {
    type: 'paragraph',
    children: [{ text: 'The front and back of the cursor will have two colors' }]
  }
]

const renderElement = ({ attributes, children }: RenderElementProps) => h('p', attributes, children)

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => h('span', {
  ...attributes,
  style: {
    backgroundColor: 'highlight' in leaf ? '#ffeeba' : undefined
  }
}, children)

const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue
const decorate = ([node, path]: NodeEntry): DecoratedRange[] => {
  const ranges: DecoratedRange[] = []
  if (!editor.selection || !Text.isText(node)) {
    return ranges
  }
  const offset = node.text.length
  if (Path.isCommon(path, editor.selection.focus.path)) {
    ranges.push({
      anchor: { path, offset: editor.selection.focus.offset },
      focus: { path, offset },
      highlight: true,
    })
  }
  if (Path.isAfter(path, editor.selection.focus.path)) {
    ranges.push({
      anchor: { path, offset: 0 },
      focus: { path, offset },
      highlight: true,
    })
  }
  return ranges
}
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf" :decorate="decorate"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>
