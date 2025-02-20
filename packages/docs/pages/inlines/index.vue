<script setup lang="ts">
import { withDOM, Slate, Editable, defaultRenderPlaceHolder, createEditor, Transforms, Range, Editor, Element, withHistory } from "slate-vue"
import { computed, h } from "vue";
import type { Descendant, DOMEditor, RenderElementProps, RenderLeafProps, } from "slate-vue";
import { ButtonElement, LinkElement } from "../../custom-types";
import isUrl from "is-url";
import { isKeyHotkey } from "is-hotkey";
import Toolbar from "../../components/Toolbar.vue";
import Button from "../../components/Button.vue";
import LinkComponent from "./LinkComponent.vue";
import BadgeComponent from "./BadgeComponent.vue";
import ButtonComponent from "./ButtonComponent.vue";
import { useInheritRef } from 'slate-vue'

const isLinkActive = computed(() => {
  const [link] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
  })
  return !!link
})

const wrapLink = (url: string) => {
  if (isLinkActive.value) {
    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    })
  }
  const isCollapsed = editor.selection && Range.isCollapsed(editor.selection)
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

const isButtonActive = computed(() => {
  const [button] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'button',
  })
  return !!button
})

const withInlines = (editor: DOMEditor) => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor

  editor.isInline = element =>
    ['link', 'button', 'badge'].includes(element.type) || isInline(element)

  editor.isElementReadOnly = element =>
    element.type === 'badge' || isElementReadOnly(element)

  editor.isSelectable = element =>
    element.type !== 'badge' && isSelectable(element)

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')

    if (text && isUrl(text)) {
      wrapLink(text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to block nodes, you can create inline nodes. Here is a ',
      },
      {
        type: 'link',
        url: 'https://en.wikipedia.org/wiki/Hypertext',
        children: [{ text: 'hyperlink' }],
      },
      {
        text: ', and here is a more unusual inline: an ',
      },
      {
        type: 'button',
        children: [{ text: 'editable button' }],
      },
      {
        text: '! Here is a read-only inline: ',
      },
      {
        type: 'badge',
        children: [{ text: 'Approved' }],
      },
      {
        text: '.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'There are two ways to add links. You can either add a link via the toolbar icon above, or if you want in on a little secret, copy a URL to your keyboard and paste it while a range of text is selected. ',
      },
      {
        type: 'link',
        url: 'https://twitter.com/JustMissEmma/status/1448679899531726852',
        children: [{ text: 'Finally, here is our favorite dog video.' }],
      },
      { text: '' },
    ],
  },
]

const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'link':
      return h(LinkComponent, { ...attributes, element }, () => children)
    case 'button':
      return h(ButtonComponent, { ...attributes, element }, () => children)
    case "badge":
      return h(BadgeComponent, useInheritRef(attributes), () => children)
    default:
      return h('p', attributes, children)
  }
}
const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return h('span', {
    ...attributes, style: {
      paddingLeft: leaf.text === '' ? '0.1px' : ''
    }
  }, children)
}
const editor = withHistory(withInlines(withDOM(createEditor(initialValue))))
const onKeyDown = (event: KeyboardEvent) => {
  // Default left/right behavior is unit:'character'.
  // This fails to distinguish between two cursor positions, such as
  // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
  // Here we modify the behavior to unit:'offset'.
  // This lets the user step into and out of the inline without stepping over characters.
  // You may wish to customize this further to only use unit:'offset' in specific cases.
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    if (isKeyHotkey('left', event)) {
      event.preventDefault()
      Transforms.move(editor, { unit: 'offset', reverse: true })
      return
    }
    if (isKeyHotkey('right', event)) {
      event.preventDefault()
      Transforms.move(editor, { unit: 'offset' })
      return
    }
  }
}

const onLinkMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  const url = window.prompt('Enter the URL of the link:')
  if (url && editor.selection) {
    wrapLink(url)
  }
}
const onOffLinkMouseDown = (event: MouseEvent) => {
  if (isLinkActive.value) {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    })
  }
}

const onSmarkMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  if (isButtonActive.value) {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'button',
    })
  } else if (editor.selection) {
    if (isButtonActive.value) {
      Transforms.unwrapNodes(editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'button',
      })
    }

    const isCollapsed = editor.selection && Range.isCollapsed(editor.selection)
    const button: ButtonElement = {
      type: 'button',
      children: isCollapsed ? [{ text: 'Edit me!' }] : [],
    }

    if (isCollapsed) {
      Transforms.insertNodes(editor, button)
    } else {
      Transforms.wrapNodes(editor, button, { split: true })
      Transforms.collapse(editor, { edge: 'end' })
    }
  }
}

</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Toolbar>
      <Button :active="isLinkActive" @mousedown="onLinkMouseDown">
        link
      </Button>
      <Button :active="isLinkActive" @mousedown="onOffLinkMouseDown">
        link_off
      </Button>
      <Button active @mousedown="onSmarkMouseDown">
        smart_button
      </Button>
    </Toolbar>
    <Editable placeholder="Enter some text..." :spellcheck="false" @keydown="onKeyDown" />
  </Slate>
</template>
