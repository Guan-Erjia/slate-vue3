<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, type RenderElementProps, type RenderLeafProps } from "slate-vue3"
import { CSSProperties, h, onMounted, onUnmounted, ref } from "vue";
import Toolbar from '../../components/Toolbar.vue'
import MarkButton from "../rich-text/MarkButton.vue";
import BlockButton from "../rich-text/BlockButton.vue";
import { CustomElement } from "../../custom-types";
import { withYjs, YjsEditor } from "@slate-yjs/core";
import { withDOM } from "slate-vue3/dom";
import { createEditor, Editor, Transforms } from "slate-vue3/core";
import { createClient } from "@liveblocks/client";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import * as Y from "yjs";


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
const client = createClient({
  publicApiKey: "",
});
const info = client.enterRoom("my-room");
const yProvider = getYjsProviderForRoom(info.room);
const sharedType = yProvider.getYDoc().get("slate", Y.XmlText) as Y.XmlText;;
const connected = ref(false)

onMounted(() => {
  yProvider.on('sync', (e: boolean) => connected.value = e)
  YjsEditor.connect(editor);
})
onUnmounted(() => {
  info.leave()
  yProvider.off('sync', (e: boolean) => connected.value = e)
  YjsEditor.disconnect(editor);
})

const editor = withYjs(withDOM(createEditor(initialValue) as any), sharedType)
const { normalizeNode } = editor;
editor.normalizeNode = (entry: [any]) => {
  const [node] = entry;

  if (!Editor.isEditor(node) || node.children.length > 0) {
    return normalizeNode(entry);
  }

  Transforms.insertNodes(editor, {
    type: "paragraph",
    children: [{ text: "" }],
  }, { at: [0] });
};
</script>

<template>
  <Slate v-if="connected && sharedType && yProvider" :editor="editor" :render-element="renderElement"
    :render-leaf="renderLeaf" :render-placeholder="defaultRenderPlaceHolder">
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
