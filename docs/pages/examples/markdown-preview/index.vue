<template>
  <Slate :editor :render-leaf :decorate>
    <Editable placeholder="Enter some text..." />
  </Slate>
</template>
<script lang="ts" setup>
import {
  Slate,
  Editable,
  RenderLeafProps,
  createReactiveEditor,
} from "slate-vue3";
import { CSSProperties, h } from "vue";
import Prism from "../../../utils/prism";
import { DecoratedRange, Descendant, Node, NodeEntry } from "slate";
import { withHistory } from "slate-history";

const markdownGrammar = Prism.languages.extend("markdown", {}) as Record<
  string,
  Prism.GrammarValue
>;
const titles = markdownGrammar.title;

if (Array.isArray(titles)) {
  for (const title of titles) {
    if (!(title instanceof RegExp)) {
      title.inside = {
        ...title.inside,
        bold: markdownGrammar.bold,
        italic: markdownGrammar.italic,
        "code-snippet": markdownGrammar["code-snippet"],
      };
    }
  }
}

const decoratedTokenTypes = new Set([
  "bold",
  "italic",
  "underlined",
  "title",
  "list",
  "hr",
  "blockquote",
  "code",
]);

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.",
      },
    ],
  },
  {
    type: "paragraph",
    children: [{ text: "## Try it out!" }],
  },
  {
    type: "paragraph",
    children: [{ text: "Try it out for yourself!" }],
  },
];

const decorate = ([node, path]: NodeEntry): DecoratedRange[] => {
  const ranges: any[] = [];

  if (!Node.isText(node)) {
    return ranges;
  }

  const decorateTokens = (
    tokens: Array<string | Prism.Token>,
    offset: number,
  ): number => {
    for (const token of tokens) {
      const start = offset;

      if (typeof token === "string") {
        offset += token.length;
      } else {
        const content = Array.isArray(token.content)
          ? token.content
          : [token.content];
        offset = decorateTokens(content, offset);
        if (decoratedTokenTypes.has(token.type)) {
          ranges.push({
            [token.type]: true,
            anchor: { path, offset: start },
            focus: { path, offset },
          });
        }
      }
    }

    return offset;
  };

  decorateTokens(Prism.tokenize(node.text, markdownGrammar), 0);

  return ranges;
};

const editor = withHistory(createReactiveEditor());
editor.children = initialValue;

const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;
  const style: CSSProperties = {
    fontWeight: leaf.bold ? "bold" : "",
    fontStyle: leaf.italic ? "italic" : "",
    textDecoration: leaf.underlined ? "underline" : "",
  };
  if (leaf.title) {
    style.display = "inline-block";
    style.fontWeight = "bold";
    style.fontSize = "20px";
    style.margin = "20px 0 10px 0";
  }
  if (leaf.list) {
    style.paddingLeft = "10px";
    style.fontSize = "20px";
    style.lineHeight = "10px";
  }
  if (leaf.hr) {
    style.display = "block";
    style.textAlign = "center";
    style.borderBottom = "2px solid #ddd";
  }
  if (leaf.blockquote) {
    style.display = "inline-block";
    style.borderLeft = "2px solid #ddd";
    style.paddingLeft = "10px";
    style.color = "#aaa";
    style.fontStyle = "italic";
  }
  if (leaf.code) {
    style.fontFamily = "__Consolas";
    style.backgroundColor = "#eee";
    style.padding = "3px";
  }

  return h("span", { ...attributes, style }, children);
};
</script>
