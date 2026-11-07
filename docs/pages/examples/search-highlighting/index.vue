<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderLeafProps,
  createReactiveEditor,
} from "slate-vue3";
import { computed, h, ref } from "vue";
import Toolbar from "../../../components/Toolbar.vue";
import { DecoratedRange, Descendant, NodeEntry, Node } from "slate";
import { withHistory } from "slate-history";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "This is editable text that you can search. As you search, it looks for matching strings of text, and adds ",
      },
      { text: "decorations", bold: true },
      { text: " to them in realtime." },
    ],
  },
  {
    type: "paragraph",
    children: [
      { text: "Try it out for yourself by typing in the search box above!" },
    ],
  },
];

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return h(
    "span",
    {
      ...attributes,
      "data-cy": "highlight" in leaf ? "search-highlighted" : undefined,
      style: {
        fontWeight: "bold" in leaf ? "bold" : undefined,
        backgroundColor: "highlight" in leaf ? "#ffeeba" : undefined,
      },
    },
    children,
  );
};

const search = ref("");
const searchPattern = computed(() =>
  search.value
    ? new RegExp(search.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu")
    : null,
);

const decorate = ([node, path]: NodeEntry): DecoratedRange[] => {
  const ranges: DecoratedRange[] = [];
  const pattern = searchPattern.value;
  if (
    pattern &&
    Node.isElement(node) &&
    Array.isArray(node.children) &&
    node.children.every(Node.isText)
  ) {
    const texts = node.children.map((it) => it.text);
    const str = texts.join("");
    let index = 0;
    let iterated = 0;
    for (const match of str.matchAll(pattern)) {
      const start = match.index!;
      const length = match[0].length;
      // Skip already iterated strings
      while (index < texts.length && start >= iterated + texts[index].length) {
        iterated = iterated + texts[index].length;
        index++;
      }
      // Find the index of array and relative position
      let offset = start - iterated;
      let remaining = length;
      while (index < texts.length && remaining > 0) {
        const currentText = texts[index];
        const currentPath = [...path, index];
        const taken = Math.min(remaining, currentText.length - offset);
        ranges.push({
          anchor: { path: currentPath, offset },
          focus: { path: currentPath, offset: offset + taken },
          highlight: true,
        });
        remaining = remaining - taken;
        if (remaining > 0) {
          iterated = iterated + currentText.length;
          // Next block will be indexed from 0
          offset = 0;
          index++;
        }
      }
    }
  }
  return ranges;
};

const editor = withHistory(createReactiveEditor());
editor.children = initialValue;
</script>

<template>
  <Slate :editor :decorate :render-leaf>
    <Toolbar>
      <div style="position: relative">
        <span
          style="
            position: absolute;
            top: 0.5em;
            left: 0.6em;
            color: #ccc;
            font-family: Material Icons;
          "
          >search</span
        >
        <input
          type="search"
          placeholder="Search the text..."
          v-model="search"
          style="padding-left: 2.5em; width: 100%"
        />
      </div>
    </Toolbar>
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>
