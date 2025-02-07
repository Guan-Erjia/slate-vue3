<script setup lang="ts">
import { withDOM, Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withHistory } from "slate-vue"
import { h } from "vue";
import type { RenderElementProps } from "slate-vue";

const renderElement = ({ attributes, children }: RenderElementProps) => {
  return h('p', attributes, children)
}

const editor1 = withHistory(withDOM(createEditor([{
  type: 'paragraph',
  children: [{ text: 'This editor is styled using the style prop.' }],
}])))

const editor2 = withHistory(withDOM(createEditor([{
  type: 'paragraph',
  children: [{ text: 'This editor is styled using the className prop.' }],
}])))
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 40px">
    <Slate :editor="editor1" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
      :render-placeholder="defaultRenderPlaceHolder">
      <Editable style="background-color: rgb(255, 230, 156); min-height: 200px;outline: rgb(0, 128, 0) solid 2px" />
    </Slate>
    <Slate :editor="editor2" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
      :render-placeholder="defaultRenderPlaceHolder">
      <Editable style="background-color: rgb(218, 225, 255);
          padding: 40px;
          font-size: 20px;
          min-height: 150px;
          outline: 3px dashed rgb(0, 94, 128);
          border-radius: 20px;
          outline-offset: -10px;
          white-space: pre-wrap;" />
    </Slate>
  </div>
</template>
