<template>
  <Slate :editor :render-leaf :decorate :render-placeholder>
    <Editable spellcheck auto-focus placeholder="Enter some text…" />
  </Slate>
</template>
<script lang="ts" setup>
import {
  Slate,
  Editable,
  RenderLeafProps,
  RenderPlaceholderProps,
} from "slate-vue3";
import { createEditor, Path, Node, Editor } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";
import { h } from "vue";
import PrefixComp from "./PrefixComp.vue";

const editor = withHistory(withDOM(createEditor()));
editor.children = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.prefix) {
    return h("span", attributes, [h(PrefixComp), children]);
  }
  return h("span", attributes, children);
};

const decorate = ([, path]: [Node, Path]) => {
  const ranges = [];
  if (Path.equals(path, Editor.start(editor, []).path)) {
    ranges.push({
      anchor: { path, offset: 0 },
      focus: { path, offset: 1 },
      prefix: true,
    });
  }
  return ranges;
};

const style = {
  color: "gray",
  position: "absolute",
  pointerEvents: "none",
  top: "0px",
  left: "64px",
};

const renderPlaceholder = ({ attributes, children }: RenderPlaceholderProps) =>
  h(
    "span",
    {
      ...attributes,
      style,
    },
    children,
  );
</script>
