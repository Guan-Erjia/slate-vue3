<template>
  <Toolbar>
    <Button data-test-id="code-block-button" active @mousedown="onMouseDown">
      code
    </Button>
  </Toolbar>
</template>
<script lang="ts" setup>
import Toolbar from '../../components/Toolbar.vue';
import Button from '../../components/Button.vue';
import { Transforms, useEditor, Element } from 'slate-vue';

const editor = useEditor()
const ParagraphType = 'paragraph'
const CodeBlockType = 'code-block'
const CodeLineType = 'code-line'
const onMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  Transforms.wrapNodes(
    editor,
    { type: CodeBlockType, language: 'html', children: [] },
    {
      match: n => Element.isElement(n) && n.type === ParagraphType,
      split: true,
    }
  )
  Transforms.setNodes(
    editor,
    { type: CodeLineType as any },
    { match: n => Element.isElement(n) && n.type === ParagraphType }
  )
}
</script>