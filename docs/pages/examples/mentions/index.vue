<script setup lang="ts">
import { computed, CSSProperties, h, ref } from "vue";
import { Slate, Editable, useInheritRef, type RenderElementProps, type RenderLeafProps } from "slate-vue3"
import { createEditor, Descendant, Editor, Range, Transforms } from "slate-vue3/core";
import { DOMEditor, withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";
import Mention from "./Mention.vue";
import { CHARACTERS } from "./utils";
import { CustomEditor } from "../../../custom-types";

const withMentions = (editor: CustomEditor) => {
  const { isInline, isVoid, markableVoid } = editor
  editor.isInline = element => {
    return element.type === 'mention' ? true : isInline(element)
  }
  editor.isVoid = element => {
    return element.type === 'mention' ? true : isVoid(element)
  }
  editor.markableVoid = element => {
    return element.type === 'mention' || markableVoid(element)
  }
  return editor
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows how you might implement a simple ',
      },
      {
        text: '@-mentions',
        bold: true,
      },
      {
        text: ' feature that lets users autocomplete mentioning a user by their username. Which, in this case means Star Wars characters. The ',
      },
      {
        text: 'mentions',
        bold: true,
      },
      {
        text: ' are rendered as ',
      },
      {
        text: 'void inline elements',
        code: true,
      },
      {
        text: ' inside the document.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Try mentioning characters, like ' },
      {
        type: 'mention',
        character: 'R2-D2',
        children: [{ text: '', bold: true }],
      },
      { text: ' or ' },
      {
        type: 'mention',
        character: 'Mace Windu',
        children: [{ text: '' }],
      },
      { text: '!' },
    ],
  },
]

const renderElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'mention':
      return h(Mention, { ...useInheritRef(attributes), element }, () => children)
    default:
      return h('p', attributes, children)
  }
}

const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props
  if ('bold' in leaf) {
    return h('strong', attributes, children)
  }
  if ('code' in leaf) {
    return h('code', attributes, children)
  }
  if ('italic' in leaf) {
    return h('em', attributes, children)
  }
  if ('underline' in leaf) {
    return h('u', attributes, children)
  }
  return h('span', attributes, children)
}

const editor = withHistory(withMentions(withDOM(createEditor())))
editor.children = initialValue;
const target = ref<Range>()
const index = ref(0)
const search = ref('')

const insertMention = (character: string) => {
  Transforms.insertNodes(editor, {
    type: 'mention',
    character,
    children: [{ text: '' }]
  })
  Transforms.move(editor)
}

const chars = computed(() => CHARACTERS.filter(c =>
  c.toLowerCase().startsWith(search.value.toLowerCase())
).slice(0, 10))

const onKeyDown = (event: KeyboardEvent) => {
  if (target.value && chars.value.length > 0) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        const prevIndex = index.value >= chars.value.length - 1 ? 0 : index.value + 1
        index.value = (prevIndex)
        break
      case 'ArrowUp':
        event.preventDefault()
        const nextIndex = index.value <= 0 ? chars.value.length - 1 : index.value - 1
        index.value = nextIndex
        break
      case 'Tab':
      case 'Enter':
        event.preventDefault()
        Transforms.select(editor, target.value)
        insertMention(chars.value[index.value])
        target.value = undefined
        break
      case 'Escape':
        event.preventDefault()
        target.value = undefined
        break
    }
  }
}

const onSlateChange = () => {
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const [start] = Range.edges(editor.selection)
    const wordBefore = Editor.before(editor, start, { unit: 'word' })
    const before = wordBefore && Editor.before(editor, wordBefore)
    const beforeRange = before && Editor.range(editor, before, start)
    const beforeText = beforeRange && Editor.string(editor, beforeRange)
    const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/)
    const after = Editor.after(editor, start)
    const afterRange = Editor.range(editor, start, after)
    const afterText = Editor.string(editor, afterRange)
    const afterMatch = afterText.match(/^(\s|$)/)

    if (beforeMatch && afterMatch) {
      target.value = beforeRange
      search.value = beforeMatch[1]
      index.value = 0
      return
    }
  }
  target.value = undefined
}
const onCharClick = (char: string) => {
  if (target.value) {
    Transforms.select(editor, target.value)
    insertMention(char)
    target.value = undefined
  }
}

const menuStyle = computed(() => {
  const style: CSSProperties = {
    position: 'absolute',
    zIndex: 1,
    padding: '3px',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 5px rgba(0,0,0,.2)',
    display: 'none'
  }
  if (target.value && chars.value.length) {
    const domRange = DOMEditor.toDOMRange(editor, target.value)
    const rect = domRange.getBoundingClientRect()
    style.top = `${rect.top + window.pageYOffset + 24}px`
    style.left = `${rect.left + window.pageXOffset}px`
    style.display = 'block'
  }
  return style
})

</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf" @change="onSlateChange">
    <Editable @keydown="onKeyDown" placeholder="Enter some text..." spellcheck />
    <Teleport to="body">
      <div :style="menuStyle" data-cy="mentions-portal">
        <div v-for="(char, i) in chars" :key="char" @click="onCharClick(char)"
          style="padding: 1px 3px;border-radius: 3px;cursor: pointer;"
          :style="{ background: i === index ? '#B4D5FF' : 'transparent' }">
          {{ char }}
        </div>
      </div>
    </Teleport>
  </Slate>
</template>
