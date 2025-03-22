<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, type RenderElementProps, type RenderLeafProps } from "slate-vue3"
import { CSSProperties, h, nextTick, onMounted, onUnmounted } from "vue";
import { CustomElement } from "../../custom-types";
import { withYjs, YjsEditor } from "../../../slate-yjs/index";
import { withDOM } from "slate-vue3/dom";
import { createEditor, Editor, Transforms } from "slate-vue3/core";
import { XmlText } from "yjs";
import Toolbar from '../../components/Toolbar.vue'
import MarkButton from "../rich-text/MarkButton.vue";
import BlockButton from "../rich-text/BlockButton.vue";

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

const renderLeaf = ({ leaf, attributes, children, }: RenderLeafProps) => {
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
}>()

const editor = withYjs(withDOM(createEditor(initialValue)), props.sharedType)
const { normalizeNode } = editor;
editor.normalizeNode = (entry: [any]) => {
  const [node] = entry;

  if (!Editor.isEditor(node) || node.children.length > 0) {
    return normalizeNode(entry);
  }
  // 必须更新 DOM 后才执行 insertNodes，更新太快 shareRoot 来不及反应会报错
  nextTick(() => {
    Transforms.insertNodes(editor, initialValue[0], { at: [0] });
  })
};

onMounted(() => {
  YjsEditor.connect(editor);
})
onUnmounted(() => {
  YjsEditor.disconnect(editor);
})
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
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
