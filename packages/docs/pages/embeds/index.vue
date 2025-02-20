<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Enter some text..." />
  </Slate>
</template>
<script lang="ts" setup>
import { createEditor, Descendant, withDOM, Slate, Editable, RenderElementProps, defaultRenderLeaf, defaultRenderPlaceHolder, useInheritRefAttrs, DOMEditor, withHistory } from 'slate-vue';
import { h } from 'vue';
import VideoElement from './VideoElement.vue'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
      },
    ],
  },
  {
    type: 'video',
    url: 'https://player.vimeo.com/video/26689853',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Try it out! This editor is built to handle Vimeo embeds, but you could handle any type.',
      },
    ],
  },
]


const withEmbeds = (editor: DOMEditor) => {
  const isVoid = editor.isVoid
  editor.isVoid = element => (element.type === 'video' ? true : isVoid(element))
  return editor
}

const editor = withHistory(withEmbeds(withDOM(createEditor(initialValue))))
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'video':
      return h(VideoElement, { element, ...useInheritRefAttrs(attributes) }, () => children)
    default:
      return h('p', attributes, children)
  }
}
</script>