<script setup lang="ts">
import { Slate, Editable, } from "slate-vue3"
import type { RenderElementProps, RenderLeafProps } from "slate-vue3";
import { h, ref } from "vue";
import Toolbar from '../../../components/Toolbar.vue'
import isHotkey from "is-hotkey";
import Button from '../../../components/Button.vue'
import { createEditor, Descendant, Editor } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";
import { DOMEditor, withDOM } from "slate-vue3/dom";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In this example, the document gets rendered into a controlled ',
      },
      { text: '<iframe>', code: true },
      {
        text: '. This is ',
      },
      {
        text: 'particularly',
        italic: true,
      },
      {
        text: ' useful, when you need to separate the styles for your editor contents from the ones addressing your UI.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'This also the only reliable method to preview any ',
      },
      {
        text: 'media queries',
        bold: true,
      },
      {
        text: ' in your CSS.',
      },
    ],
  },
]


const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  let _children = children
  if ('bold' in leaf) {
    _children = h('span', attributes, h('strong', null, _children))
  }
  if ('code' in leaf) {
    _children = h('span', attributes, h('code', null, _children))
  }
  if ('italic' in leaf) {
    _children = h('span', attributes, h('em', null, _children))
  }
  if ('underline' in leaf) {
    _children = h('span', attributes, h('u', null, _children))
  }
  return h('span', attributes, _children)
}

const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue;
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}
const isMarkActive = (format: string) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format as keyof typeof marks] === true : false
}
const toggleMark = (format: string, event?: Event) => {
  event?.preventDefault()
  const isActive = isMarkActive(format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const onKeyDown = (event: KeyboardEvent) => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault()
      const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS]
      toggleMark(mark)
    }
  }
}

const iframeBody = ref()
const handleLoad = (e: Event) => {
  if (e.target instanceof HTMLIFrameElement && e.target.contentDocument) {
    iframeBody.value = e.target.contentDocument.body
  }
}

const onBlur = () => {
  DOMEditor.deselect(editor)
}
</script>

<template>
  <Slate :editor="editor" :render-leaf="renderLeaf">
    <Toolbar>
      <Button :active="isMarkActive('bold')" @mousedown="toggleMark('bold', $event)">
        format_bold
      </Button>
      <Button :active="isMarkActive('italic')" @mousedown="toggleMark('italic', $event)">
        format_italic
      </Button>
      <Button :active="isMarkActive('underline')" @mousedown="toggleMark('underline', $event)">
        format_underlined
      </Button>
      <Button :active="isMarkActive('code')" @mousedown="toggleMark('code', $event)">
        code
      </Button>
    </Toolbar>
    <iframe srcdoc="<!DOCTYPE html>" @load="handleLoad" @blur="onBlur">
      <Teleport v-if="iframeBody" :to="iframeBody">
        <Editable placeholder="Enter some rich text…" spellcheck @keydown="onKeyDown" />
      </Teleport>
    </iframe>
  </Slate>
</template>
