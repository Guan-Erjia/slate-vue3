<script setup lang="ts">
import type { Descendant } from "slate";
import {
  createReactiveEditor,
  Editable,
  Slate,
  type RenderElementProps,
} from "slate-vue3";
import { h, watch } from "vue";

const editor = createReactiveEditor();

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "inside" }] },
];
editor.children = initialValue;

const renderElement = ({ attributes, children }: RenderElementProps) =>
  h("div", { ...attributes, contenteditable: false }, [
    h("span", null, "Fixed header"),
    h(
      "span",
      {
        contenteditable: true,
        "data-testid": "island",
      },
      children,
    ),
  ]);

watch(
  () => editor,
  () => {
    console.log(JSON.stringify(editor.selection));
  },
  {
    deep: true,
  },
);
</script>

<template>
  <Slate :editor="editor" :render-element>
    <Editable />
  </Slate>
</template>
