<script setup lang="ts">
import { withDOM, Node, Element, Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, Transforms, Editor } from "slate-vue"
import { h } from "vue";
import type { Descendant, DOMEditor, RenderElementProps, } from "slate-vue";
import { TitleElement, ParagraphElement } from "../../custom-types";

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
    type: 'title',
    children: [{ text: 'Enforce Your Layout!' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows how to enforce your layout with domain-specific constraints. This document will always have a title block at the top and at least one paragraph in the body. Try deleting them and see what happens!',
      },
    ],
  },
]

const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'title':
      return h('h2', attributes, children)
    default:
      return h('p', attributes, children)
  }
}
const editor = withLayout(withDOM(createEditor(initialValue)))
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Enter a title…" spellCheck />
  </Slate>
</template>
