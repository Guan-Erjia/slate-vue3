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
  createReactiveEditor,
} from "slate-vue3";
import { Path, Editor, NodeEntry } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";
import { h } from "vue";
import PrefixComp from "./PrefixComp.vue";

const editor = withHistory(createReactiveEditor());
editor.children = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if ("prefix" in leaf && leaf.prefix) {
    return h("span", attributes, [h(PrefixComp), children]);
  }
  return h("span", attributes, children);
};

const decorate = ([, path]: NodeEntry) => {
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
