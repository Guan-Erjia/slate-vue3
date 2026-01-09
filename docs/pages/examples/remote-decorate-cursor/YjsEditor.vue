<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
} from "slate-vue3";
import { createEditor, Node, Transforms } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import {
  getRemoteCaretsOnLeaf,
  getRemoteCursorsOnLeaf,
  useDecorateRemoteCursors,
  withCursors,
  withYHistory,
  withYjs,
  YjsEditor,
} from "slate-vue3/yjs";
import { CSSProperties, h, onMounted, onUnmounted, VNodeChild } from "vue";
import { XmlText } from "yjs";
import { CustomElement } from "../../../custom-types";
import Toolbar from "../../../components/Toolbar.vue";
import MarkButton from "../rich-text/MarkButton.vue";
import BlockButton from "../rich-text/BlockButton.vue";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { faker } from "@faker-js/faker";

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
    case "block-quote":
      return h("blockquote", attributes, children);

    case "bulleted-list":
      return h("ul", attributes, children);

    case "heading-one":
      return h("h1", attributes, children);

    case "heading-two":
      return h("h2", attributes, children);

    case "heading-three":
      return h("h3", attributes, children);

    case "list-item":
      return h("li", attributes, children);

    case "numbered-list":
      return h("ol", attributes, children);

    default:
      return h("p", attributes, children);
  }
};

const renderLeaf = ({ leaf, attributes, children }: RenderLeafProps) => {
  let _children: VNodeChild = children;
  let style: CSSProperties = {};
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
  getRemoteCursorsOnLeaf<{ name: string }, Text>(leaf).forEach((cursor) => {
    if (cursor.data) {
      style.backgroundColor = "rgba(255, 0, 0, 0.5)";
      attributes.contenteditable = false;
      attributes.unselectable = "on";
    }
  });

  getRemoteCaretsOnLeaf<{ name: string }, Text>(leaf).forEach((caret) => {
    if (caret.data) {
      style = { position: "absolute", fontWeight: "normal" };
      _children = [
        h("span", {
          contenteditable: false,
          className: "cursor",
        }),
        h(
          "span",
          {
            contenteditable: false,
            className: "label",
          },
          [caret.data.name],
        ),
        children,
      ];
    }
  });

  return h(
    "code" in leaf ? "code" : "bold" in leaf ? "strong" : "span",
    { ...attributes, style },
    _children,
  );
};

const props = defineProps<{
  sharedType: XmlText;
  provider: LiveblocksYjsProvider;
}>();

const editor = withCursors(
  withYHistory(withYjs(withDOM(createEditor()), props.sharedType)),
  props.provider.awareness,
  {
    data: {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      // color: ...
      // can add other remote data
    },
  },
);
editor.children = initialValue;
const { normalizeNode } = editor;
editor.normalizeNode = (entry: [Node]) => {
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
const decorate = useDecorateRemoteCursors(editor, true);
</script>

<template>
  <Slate :editor :render-element :render-leaf :decorate>
    <Toolbar>
      <MarkButton format="bold" icon="format_bold" />
      <MarkButton format="italic" icon="format_italic" />
      <MarkButton format="underline" icon="format_underlined" />
      <MarkButton format="code" icon="code" />
      <BlockButton format="heading-one" icon="looks_one" />
      <BlockButton format="heading-two" icon="looks_two" />
      <BlockButton format="block-quote" icon="format_quote" />
      <BlockButton format="numbered-list" icon="format_list_numbered" />
      <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      <BlockButton format="left" icon="format_align_left" />
      <BlockButton format="center" icon="format_align_center" />
      <BlockButton format="right" icon="format_align_right" />
      <BlockButton format="justify" icon="format_align_justify" />
    </Toolbar>
    <Editable placeholder="Enter some rich text…" spellcheck />
  </Slate>
</template>
<style>
.cursor {
  background: black;
  width: 2px;
  position: absolute;
  height: 100%;
  top: 0;
}

.label {
  transform: translateY(-100%);
  background: gray;
  position: absolute;
  font-size: 14px;
  color: white;
  white-space: nowrap;
  top: 0;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  padding: 6px 2px;
}

.selection {
  position: absolute;
  background-color: rgba(255, 0, 0, 0.5);
  cursor: none;
}
</style>
