<template>
  <Slate :editor :render-element>
    <Editable placeholder="Write some markdown..." spellcheck />
  </Slate>
</template>
<script lang="ts" setup>
import {
  Slate,
  Editable,
  RenderElementProps,
  createReactiveEditor,
} from "slate-vue3";
import { h } from "vue";
import { withShortcuts } from "./plugin";
import { Descendant } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: "blockquote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    children: [
      {
        text: 'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: "heading",
    depth: 2,
    children: [{ text: "Try it out!" }],
  },
  {
    type: "paragraph",
    children: [
      {
        text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
];

const editor = withHistory(withShortcuts(createReactiveEditor()));
editor.children = initialValue;
const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  return h(
    element.type === "blockquote"
      ? "blockquote"
      : element.type === "bulleted-list"
        ? "ul"
        : element.type === "heading"
          ? `h${element.depth}`
          : element.type === "list-item"
            ? "li"
            : "p",
    attributes,
    children,
  );
};
</script>
