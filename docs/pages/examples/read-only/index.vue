<script setup lang="ts">
import { createEditor, Descendant } from "slate-vue3/core";
import { Slate, Editable, type RenderElementProps } from "slate-vue3"
import { h } from "vue";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows what happens when the Editor is set to readOnly, it is not editable',
      },
    ],
  }
]

const editor = withHistory(withDOM(createEditor())) 
editor.children = initialValue;
</script>

<template>
  <Slate :editor="editor">
    <Editable :read-only="true" placeholder="Enter some plain text..." />
  </Slate>
</template>
