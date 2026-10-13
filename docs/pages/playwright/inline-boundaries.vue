<script setup lang="ts">
import {
  createReactiveEditor,
  Editable,
  Slate,
  type RenderElementProps,
} from "slate-vue3";
import type { Descendant } from "slate";
import { h } from "vue";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      { text: "" },
      { type: "link", url: "#", children: [{ text: "link" }] },
      { text: "" },
    ],
  },
];

const editor = createReactiveEditor();
editor.isInline = (element: any) => element.type === "link";
editor.children = initialValue;

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) =>
  (element as { type?: string }).type === "link"
    ? h(
        "span",
        { ...attributes, style: { padding: "0 24px", background: "#ddd" } },
        children,
      )
    : h("div", attributes, children);
</script>

<template>
  <Slate :editor="editor">
    <Editable :render-element="renderElement" />
  </Slate>
</template>
