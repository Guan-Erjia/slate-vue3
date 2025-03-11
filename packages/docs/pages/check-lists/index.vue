<script setup lang="ts">
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withDOM, withHistory, useInheritRef } from "slate-vue3"
import { h } from "vue";
import type { RenderElementProps } from "slate-vue3";
import { CustomElement } from "../../custom-types";
import CheckListItem from './CheckListsItem.vue'
import { withChecklists } from "./plugin";

const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
      },
    ],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: "Let's go to work!" }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'check-list-item':
      return h(CheckListItem, { element, ...useInheritRef(attributes) }, () => children)
    default:
      return h('p', attributes, children)
  }
}


const editor = withHistory(withChecklists(withDOM(createEditor(initialValue)))) 
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Enter some rich text…" spellCheck />
  </Slate>
</template>
