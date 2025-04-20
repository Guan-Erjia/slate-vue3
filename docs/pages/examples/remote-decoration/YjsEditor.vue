<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, type RenderElementProps, type RenderLeafProps } from "slate-vue3"
import { CSSProperties, h, onMounted, onUnmounted } from "vue";
import { CustomElement } from "../../../custom-types";
import { getRemoteCaretsOnLeaf, getRemoteCursorsOnLeaf, useDecorateRemoteCursors, withCursors, withYHistory, withYjs, YjsEditor } from "slate-vue3/yjs";
import { withDOM } from "slate-vue3/dom";
import { createEditor, Editor, Node, Transforms } from "slate-vue3/core";
import { XmlText } from "yjs";
import Toolbar from '../../../components/Toolbar.vue'
import MarkButton from "../rich-text/MarkButton.vue";
import BlockButton from "../rich-text/BlockButton.vue";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { faker } from '@faker-js/faker';
import { Awareness } from "y-protocols/awareness";

const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [
      { text: '' },
    ],
  },
]

const renderElement = ({ attributes: attrs, children, element }: RenderElementProps) => {
  const attributes = {
    ...attrs, style: {
      ['text-align']: 'align' in element ? element.align || 'left' : '',
    }
  }
  switch (element.type) {
    case 'block-quote':
      return h('blockquote', attributes, children)

    case 'bulleted-list':
      return h('ul', attributes, children)

    case 'heading-one':
      return h('h1', attributes, children)

    case 'heading-two':
      return h('h2', attributes, children)

    case 'heading-three':
      return h('h3', attributes, children)

    case 'list-item':
      return h('li', attributes, children)

    case 'numbered-list':
      return h('ol', attributes, children)

    default:
      return h('p', attributes, children)
  }
}

const renderDecoratedLeaf = ({ leaf, attributes, children: _children, }: RenderLeafProps) => {
  let children = _children

  getRemoteCursorsOnLeaf<{ name: string }, Text>(leaf).forEach((cursor) => {
    if (cursor.data) {
      children = h('span', { style: { background: 'rgba(255, 0, 0, 0.5)' } }, children)
    }
  });

  getRemoteCaretsOnLeaf<{ name: string }, Text>(leaf).forEach((caret) => {
    if (caret.data) {
      children = h('span',
        { style: { position: 'relative' } },
        [
          h('span', {
            contentEditable: false,
            className: 'cursor',
            style: {},
          }),
          h('span', {
            contentEditable: false,
            className: 'selection',
            style: { background: 'rgba(255, 0, 0, 0.5)' }
          }),
          children
        ])
    }
  });

  const style: CSSProperties = {};
  if ('bold' in leaf) {
    style.fontWeight = "bold";
  }
  if ('italic' in leaf) {
    style.fontStyle = "italic";
  }
  if ('underline' in leaf) {
    style.borderBottom = "1px solid black";
  }
  if ('delete' in leaf) {
    style.textDecoration = "line-through";
  }
  return h(
    'code' in leaf ? "code" : 'bold' in leaf ? "strong" : "span",
    { ...attributes, style },
    children
  )
}

const props = defineProps<{
  sharedType: XmlText;
  provider: LiveblocksYjsProvider
}>()

const editor = withCursors(
  withYHistory(withYjs(withDOM(createEditor()), props.sharedType)),
  props.provider.awareness as unknown as Awareness,
  {
    data: {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`
      // color: ...
      // can add other remote data
    },
  }
)
editor.children = initialValue;
const { normalizeNode } = editor;
editor.normalizeNode = (entry: [Node]) => {
  const [node] = entry;

  if (!Editor.isEditor(node) || node.children.length > 0) {
    return normalizeNode(entry);
  }
  Transforms.insertNodes(editor, initialValue[0], { at: [0] });
};

onMounted(() => {
  YjsEditor.connect(editor);
})
onUnmounted(() => {
  YjsEditor.disconnect(editor);
})
const decorate = useDecorateRemoteCursors();
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderDecoratedLeaf"
    :render-placeholder="defaultRenderPlaceHolder" :decorate="decorate">
    <Toolbar>
      <MarkButton format="bold" icon="format_bold" />
      <MarkButton format="italic" icon="format_italic" />
      <MarkButton format="underline" icon="format_underlined" />
      <MarkButton format="code" icon="code" />
      <BlockButton format="heading-one" icon="looks_one" />
      <BlockButton format="heading-two" icon="looks_two" />
      <BlockButton format="block-quote" icon="format_quote" />
      <BlockButton format="numbered-list" icon="format_list_numbered" />
      <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      <BlockButton format="left" icon="format_align_left" />
      <BlockButton format="center" icon="format_align_center" />
      <BlockButton format="right" icon="format_align_right" />
      <BlockButton format="justify" icon="format_align_justify" />
    </Toolbar>
    <Editable placeholder="Enter some rich text…" spellcheck />
  </Slate>
</template>

<style scoped>
.cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  left: -1px;
  background: 'rgba(255, 0, 0, 0.5)'
}

.selection {
  position: absolute;
  font-size: 14px;
  color: white;
  left: -1px;
  top: 0;
  white-space: nowrap;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  padding: 6px 2px;
  user-select: none;
}
</style>
