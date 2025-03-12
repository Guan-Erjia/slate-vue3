<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder } from "slate-vue3"
import type { RenderElementProps, RenderLeafProps } from "slate-vue3";
import { DOMEditor, withDOM } from "slate-vue3/dom";
import { h } from "vue";
import { Editor, Range, Element, Point, Descendant, createEditor } from 'slate-vue3/core'
import { withHistory } from "slate-vue3/history";

const withTables = (editor: DOMEditor) => {
  const { deleteBackward, deleteForward, insertBreak } = editor
  editor.deleteBackward = unit => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type === 'table-cell',
      })
      if (cell) {
        const [, cellPath] = cell
        const start = Editor.start(editor, cellPath)

        if (Point.equals(editor.selection.anchor, start)) {
          return
        }
      }
    }
    deleteBackward(unit)
  }
  editor.deleteForward = unit => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type === 'table-cell',
      })

      if (cell) {
        const [, cellPath] = cell
        const end = Editor.end(editor, cellPath)

        if (Point.equals(editor.selection.anchor, end)) {
          return
        }
      }
    }
    deleteForward(unit)
  }
  editor.insertBreak = () => {
    if (editor.selection) {
      const [table] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type === 'table',
      })
      if (table) {
        return
      }
    }
    insertBreak()
  }
  return editor
}


const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '' }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Human', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Dog', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Cat', bold: true }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Feet', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '2' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Lives', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '9' }],
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
      },
    ],
  },
]

const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'table':
      return h('table', null, h('tbody', attributes, children))
    case 'table-row':
      return h('tr', attributes, children)
    case 'table-cell':
      return h('td', attributes, children)
    default:
      return h('p', attributes, children)
  }
}
const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return h('bold' in leaf ? 'strong' : 'span', attributes, children)
}

const editor = withHistory(withTables(withDOM(createEditor(initialValue)))) 
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>
