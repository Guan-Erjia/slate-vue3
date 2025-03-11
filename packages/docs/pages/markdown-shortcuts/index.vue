<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Write some markdown..." spellCheck @beforeinput="onDomBeforeInput" />
  </Slate>
</template>
<script lang="ts" setup>
import {
  createEditor, Descendant, withDOM, Slate, Editable, RenderElementProps, defaultRenderPlaceHolder,
  defaultRenderLeaf, DOMEditor, Editor, Element, Node,
  withHistory
} from 'slate-vue3';
import { h } from 'vue';
import "prismjs";
import 'prismjs/components/prism-markdown'
import { SHORTCUTS, withShortcuts } from './plugin';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: 'heading-two',
    children: [{ text: 'Try it out!' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
]


const editor = withHistory(withShortcuts(withDOM(createEditor(initialValue))))
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  return h(element.type === 'block-quote' ? 'blockquote' :
    element.type === "bulleted-list" ? 'ul' :
      element.type === "heading-one" ? 'h1' :
        element.type === "heading-two" ? 'h2' :
          element.type === "heading-three" ? 'h3' :
            element.type === "heading-four" ? 'h4' :
              element.type === "heading-five" ? 'h5' :
                element.type === "heading-six" ? 'h6' :
                  element.type === "list-item" ? 'li' :
                    'p', attributes, children)
}

const onDomBeforeInput = (e: Event) => {
  queueMicrotask(() => {
    const pendingDiffs = DOMEditor.androidPendingDiffs(editor)

    const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
      if (!diff.text.endsWith(' ')) {
        return false
      }

      const { text } = Node.leaf(editor, path)
      const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1)
      if (!(beforeText in SHORTCUTS)) {
        return
      }

      const blockEntry = Editor.above(editor, {
        at: path,
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      })
      if (!blockEntry) {
        return false
      }

      const [, blockPath] = blockEntry
      return Editor.isStart(editor, Editor.start(editor, path), blockPath)
    })

    if (scheduleFlush) {
      DOMEditor.androidScheduleFlush(editor)
    }
  })
}
</script>