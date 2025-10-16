<template>
  <Slate :editor :render-element>
    <Editable placeholder="Write some markdown..." spellcheck />
  </Slate>
</template>
<script lang="ts" setup>
import { Slate, Editable, RenderElementProps, } from 'slate-vue3';
import { h } from 'vue';
import "prismjs";
import 'prismjs/components/prism-markdown'
import { withShortcuts } from './plugin';
import { createEditor, Descendant } from 'slate-vue3/core';
import { withHistory } from 'slate-vue3/history';
import { withDOM } from 'slate-vue3/dom';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: 'heading-two',
    children: [{ text: 'Try it out!' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
]


const editor = withHistory(withShortcuts(withDOM(createEditor())))
editor.children = initialValue;
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  return h(element.type === 'block-quote' ? 'blockquote' :
    element.type === "bulleted-list" ? 'ul' :
      element.type === "heading-one" ? 'h1' :
        element.type === "heading-two" ? 'h2' :
          element.type === "heading-three" ? 'h3' :
            element.type === "heading-four" ? 'h4' :
              element.type === "heading-five" ? 'h5' :
                element.type === "heading-six" ? 'h6' :
                  element.type === "list-item" ? 'li' :
                    'p', attributes, children)
}

</script>