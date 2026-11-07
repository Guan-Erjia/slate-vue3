<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderLeafProps,
  createReactiveEditor,
} from "slate-vue3";
import { h } from "vue";
import {
  Node,
  type DecoratedRange,
  type Descendant,
  type Editor,
  type NodeEntry,
} from "slate";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "abcdef" }] },
];

const withNoUppercase = <T extends Editor>(editor: T): T => {
  const { insertText } = editor;
  editor.insertText = (text, options) => {
    if (!/[A-Z]/.test(text)) {
      insertText(text, options);
    }
  };
  return editor;
};

const decorate = ([node, path]: NodeEntry): DecoratedRange[] =>
  Node.isText(node) && node.text.length >= 3
    ? [
        {
          anchor: { path, offset: 0 },
          focus: { path, offset: 3 },
          highlight: true,
        },
      ]
    : [];

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) =>
  h(
    "span",
    {
      ...attributes,
      style:
        "highlight" in leaf && leaf.highlight
          ? { backgroundColor: "#ffeeba" }
          : undefined,
    },
    children,
  );

const editor = withNoUppercase(createReactiveEditor());
editor.children = initialValue;
</script>

<template>
  <Slate :editor :decorate :render-leaf>
    <Editable placeholder="Uppercase letters are ignored." />
  </Slate>
</template>
