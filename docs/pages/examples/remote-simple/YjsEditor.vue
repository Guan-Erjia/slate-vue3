<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  createReactiveEditor,
} from "slate-vue3";
import { CSSProperties, h, onMounted, onUnmounted } from "vue";
import { CustomElement } from "../../../custom-types";
import { withYHistory, withYjs, YjsEditor } from "slate-vue3/yjs";
import { Node, Path, Transforms } from "slate-vue3/core";
import { XmlText } from "yjs";
import Toolbar from "../../../components/Toolbar.vue";
import MarkButton from "../rich-text/MarkButton.vue";
import BlockButton from "../rich-text/BlockButton.vue";
import AlignButton from "../rich-text/AlignButton.vue";

const initialValue: CustomElement[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const renderElement = ({
  attributes: attrs,
  children,
  element,
}: RenderElementProps) => {
  const attributes = {
    ...attrs,
    style: {
      ["text-align"]: "align" in element ? element.align || "left" : "",
    },
  };
  switch (element.type) {
    case "blockquote":
      return h("blockquote", attributes, children);

    case "bulleted-list":
      return h("ul", attributes, children);

    case "heading":
      return h(`h${element.depth}`, attributes, children);

    case "list-item":
      return h("li", attributes, children);

    case "numbered-list":
      return h("ol", attributes, children);

    default:
      return h("p", attributes, children);
  }
};

const renderLeaf = ({ leaf, attributes, children }: RenderLeafProps) => {
  const style: CSSProperties = {};
  if ("bold" in leaf) {
    style.fontWeight = "bold";
  }
  if ("italic" in leaf) {
    style.fontStyle = "italic";
  }
  if ("underline" in leaf) {
    style.borderBottom = "1px solid black";
  }
  if ("delete" in leaf) {
    style.textDecoration = "line-through";
  }
  return h(
    "code" in leaf ? "code" : "bold" in leaf ? "strong" : "span",
    { ...attributes, style },
    children,
  );
};

const props = defineProps<{
  sharedType: XmlText;
}>();

const editor = withYHistory(withYjs(createReactiveEditor(), props.sharedType));
editor.children = initialValue;
const { normalizeNode } = editor;
editor.normalizeNode = (entry: [Node, Path]) => {
  const [node] = entry;

  if (Node.isElement(node) && node.children.length > 0) {
    return normalizeNode(entry);
  }
  Transforms.insertNodes(editor, initialValue[0], { at: [0] });
};

onMounted(() => {
  YjsEditor.connect(editor);
});
onUnmounted(() => {
  YjsEditor.disconnect(editor);
});
</script>

<template>
  <Slate :editor :render-element :render-leaf>
    <Toolbar>
      <MarkButton format="bold" icon="format_bold" />
      <MarkButton format="italic" icon="format_italic" />
      <MarkButton format="underline" icon="format_underlined" />
      <MarkButton format="code" icon="code" />
      <BlockButton format="heading" :depth="1" icon="looks_one" />
      <BlockButton format="heading" :depth="2" icon="looks_two" />
      <BlockButton format="blockquote" icon="format_quote" />
      <BlockButton format="numbered-list" icon="format_list_numbered" />
      <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      <AlignButton direction="left" icon="format_align_left" />
      <AlignButton direction="center" icon="format_align_center" />
      <AlignButton direction="right" icon="format_align_right" />
      <AlignButton direction="justify" icon="format_align_justify" />
    </Toolbar>
    <Editable placeholder="Enter some rich text…" spellcheck />
  </Slate>
</template>
