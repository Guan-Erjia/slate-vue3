<script setup lang="ts">
import { Slate, Editable, type RenderElementProps, useInheritRef } from "slate-vue3"
import { h } from "vue";
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { CustomEditor, ImageElement } from "../../../custom-types";
import ImageComp from './ImageComp.vue'
import Toolbar from '../../../components/Toolbar.vue'
import Button from '../../../components/Button.vue'
import { createEditor, Descendant, Transforms } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.',
      },
    ],
  },
  {
    type: 'image',
    url: 'https://www.slatejs.org/favicon.ico',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'You can delete images with the cross in the top left. Try deleting this sheep:',
      },
    ],
  },
  {
    type: 'image',
    url: 'https://cn.vuejs.org/logo.svg',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'You can delete images with the cross in the top left. Try deleting this sheep:',
      },
    ],
  },
]

const renderElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'image':
      return h(ImageComp, { element, ...useInheritRef(attributes) }, () => children)
    default:
      return h('p', attributes, children)
  }
}

const insertImage = (editor: CustomEditor, url: string) => {
  const image: ImageElement = { type: 'image', url, children: [{ text: '' }] }
  Transforms.insertNodes(editor, image)
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  })
}


const isImageUrl = (url: string) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return ext && imageExtensions.includes(ext)
}
const withImages = (editor: CustomEditor) => {
  const { insertData, isVoid } = editor
  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files?.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            if (typeof url === 'string') {
              insertImage(editor, url)
            }
          })

          reader.readAsDataURL(file)
        }
      })
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const editor = withHistory(withImages(withDOM(createEditor())))
editor.children = initialValue;
const onMouseDown = (event: Event) => {
  event.preventDefault()
  const url = window.prompt('Enter the URL of the image:')
  if (url && !isImageUrl(url)) {
    alert('URL is not an image')
    return
  }
  url && insertImage(editor, url)
}
</script>
<template>
  <Slate :editor="editor" :render-element="renderElement">
    <Toolbar>
      <Button @mousedown="onMouseDown">
        image
      </Button>
    </Toolbar>
    <Editable style="padding: 10px;" placeholder="Enter a title…" spellcheck />
  </Slate>
</template>
