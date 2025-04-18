<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, type RenderElementProps, type RenderLeafProps } from "slate-vue3"
import { h, ref } from "vue";
import Toolbar from "../../../components/Toolbar.vue";
import { createEditor, DecoratedRange, Descendant, NodeEntry, Text, Element } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
      },
      { text: 'decorations', bold: true },
      { text: ' to them in realtime.' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Try it out for yourself by typing in the search box above!' },
    ],
  },
]

const renderElement = ({ attributes, children }: RenderElementProps) => {
  return h('p', attributes, children)
}

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return h('span', {
    ...attributes, 'data-cy': 'highlight' in leaf ? 'search-highlighted' : undefined, style: {
      fontWeight: 'bold' in leaf ? 'bold' : undefined,
      backgroundColor: 'highlight' in leaf ? '#ffeeba' : undefined
    }
  }, children)
}

const decorate = ([node, path]: NodeEntry): DecoratedRange[] => {
  const ranges = []
  if (
    search.value &&
    Element.isElement(node) &&
    Array.isArray(node.children) &&
    node.children.every(Text.isText)
  ) {
    const texts = node.children.map((it) => it.text)
    const str = texts.join('')
    const length = search.value.length
    let start = str.indexOf(search.value)
    let index = 0
    let iterated = 0
    while (start !== -1) {
      // Skip already iterated strings
      while (
        index < texts.length &&
        start >= iterated + texts[index].length
      ) {
        iterated = iterated + texts[index].length
        index++
      }
      // Find the index of array and relative position
      let offset = start - iterated
      let remaining = length
      while (index < texts.length && remaining > 0) {
        const currentText = texts[index]
        const currentPath = [...path, index]
        const taken = Math.min(remaining, currentText.length - offset)
        ranges.push({
          anchor: { path: currentPath, offset },
          focus: { path: currentPath, offset: offset + taken },
          highlight: true,
        })
        remaining = remaining - taken
        if (remaining > 0) {
          iterated = iterated + currentText.length
          // Next block will be indexed from 0
          offset = 0
          index++
        }
      }
      // Looking for next search block
      start = str.indexOf(search.value, start + search.value.length)
    }
  }
  return ranges
}

const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue;
const search = ref('')
</script>

<template>
  <Slate :editor="editor" :decorate="decorate" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Toolbar>
      <div style="position: relative;">
        <span
          style="position: absolute; top: 0.5em; left: 0.6em; color: #ccc;font-family: 'Material Icons'">search</span>
        <input type="search" placeholder="Search the text..." v-model="search" style="  padding-left: 2.5em;
        width: 100%;" />
      </div>
    </Toolbar>
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>
