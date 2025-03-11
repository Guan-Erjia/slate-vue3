<script setup lang="ts">
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withDOM, Transforms, withHistory, useInheritRef } from "slate-vue3"
import { h } from "vue";
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import type { Descendant, DOMEditor, RenderElementProps, } from "slate-vue3";
import { ImageElement } from "../../custom-types";
import ImageComp from './ImageComp.vue'
import Toolbar from '../../components/Toolbar.vue'
import Button from '../../components/Button.vue'

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

const insertImage = (editor: DOMEditor, url: string) => {
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
const withImages = (editor: DOMEditor) => {
  const { insertData, isVoid } = editor
  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
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
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const editor = withHistory(withImages(withDOM(createEditor(initialValue))))
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
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Toolbar>
      <Button @mousedown="onMouseDown">
        image
      </Button>
    </Toolbar>
    <Editable style="padding: 10px;" placeholder="Enter a title…" spellCheck />
  </Slate>
</template>
