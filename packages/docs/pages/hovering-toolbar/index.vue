<script setup lang="ts">
import { withDOM, Node, Element, Slate, Editable, defaultRenderPlaceHolder, createEditor, Transforms, Editor } from "slate-vue"
import { h } from "vue";
import type { Descendant, DOMEditor, RenderElementProps, RenderLeafProps, } from "slate-vue";
import { TitleElement, ParagraphElement } from "../../custom-types";
import HoveringToolbar from "./HoveringToolbar.vue";

const withLayout = (editor: DOMEditor) => {
  const { normalizeNode } = editor
  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      if (editor.children.length <= 1 && Editor.string(editor, [0, 0]) === '') {
        const title: TitleElement = {
          type: 'title',
          children: [{ text: 'Untitled' }],
        }
        Transforms.insertNodes(editor, title, {
          at: path.concat(0),
          select: true,
        })
      }

      if (editor.children.length < 2) {
        const paragraph: ParagraphElement = {
          type: 'paragraph',
          children: [{ text: '' }],
        }
        Transforms.insertNodes(editor, paragraph, { at: path.concat(1) })
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        const slateIndex = childPath[0]
        const enforceType = (type: 'paragraph' | 'title') => {
          if (Element.isElement(child) && child.type !== type) {
            const newProperties: Partial<Element> = { type }
            Transforms.setNodes<Element>(editor, newProperties, {
              at: childPath,
            })
          }
        }

        switch (slateIndex) {
          case 0:
            enforceType('title')
            break
          case 1:
            enforceType('paragraph')
          default:
            break
        }
      }
    }

    return normalizeNode([node, path])
  }

  return editor
}


const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows how you can make a hovering menu appear above your content, which you can use to make text ',
      },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', or anything else you might want to do!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Try it out yourself! Just ' },
      { text: 'select any piece of text and the menu will appear', bold: true },
      { text: '.' },
    ],
  },
]

const renderElement = ({ attributes, children }: RenderElementProps) => {
  return h('p', attributes, children)
}

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if ('bold' in leaf) {
    return h('strong', attributes, children)
  }

  if ('italic' in leaf) {
    return h('em', attributes, children)
  }

  if ('underlined' in leaf) {
    return h('u', attributes, children)
  }

  return h('span', attributes, children)
}

const editor = withLayout(withDOM(createEditor(initialValue)))


const onBeforeInput = (event: Event) => {
  const isMarkActive = (format: 'bold' | 'italic' | 'underlined') => {
    const marks: any = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }
  const toggleMark = (format: 'bold' | 'italic' | 'underlined') => {
    const isActive = isMarkActive(format)
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  if ('inputType' in event) {
    switch (event.inputType) {
      case 'formatBold':
        event.preventDefault()
        return toggleMark('bold')
      case 'formatItalic':
        event.preventDefault()
        return toggleMark('italic')
      case 'formatUnderline':
        event.preventDefault()
        return toggleMark('underlined')
    }
  }
}
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <HoveringToolbar />
    <Editable @beforeinput="onBeforeInput" placeholder="Enter some text..." spellCheck autoFocus />
  </Slate>
</template>
