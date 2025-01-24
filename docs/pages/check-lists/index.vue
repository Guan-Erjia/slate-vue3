<script setup lang="ts">
import { Slate, Editable } from "slate-vue"
import { h } from "vue";
import { IS_ANDROID, withDOM } from "slate-dom";
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from "slate-vue";
import { createEditor, } from "slate";
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
      return h('div', {
        ref: attributes.ref, style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }
      }, h(CheckListItem, { element }, () => children)
      )
    default:
      return h('p', attributes, children)
  }
}

const renderLeaf = ({ attributes, children, }: RenderLeafProps) => {
  return h(
    "span",
    attributes,
    children
  )
}

const renderPlaceHolder = ({ attributes, children }: RenderPlaceholderProps) => {
  return h('span', attributes, [
    children,
    IS_ANDROID ? h('br') : undefined
  ])
}

const editor = withChecklists(withDOM(createEditor(initialValue)))
</script>

<template>
  <Slate :editor="editor">
    <Editable placeholder="Enter some rich text…" spellCheck autoFocus :render-element="renderElement"
      :render-leaf="renderLeaf" :render-placeholder="renderPlaceHolder" />
  </Slate>
</template>
