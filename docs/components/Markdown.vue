<template>
  <Slate :editor :render-element :render-leaf :decorate>
    <Editable class="slate-markdown" :read-only="true" spellcheck />
  </Slate>
</template>
<script lang="ts" setup>
import {
  Slate,
  Editable,
  RenderElementProps,
  RenderLeafProps,
  useInheritRef,
} from "slate-vue3";
import { CSSProperties, h } from "vue";
import Prism from "prismjs";
import "prismjs";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import {
  createEditor,
  Editor,
  Element,
  NodeEntry,
  Node,
  Range,
} from "slate-vue3/core";
import CodeBlock from "./CodeBlock.vue";
import { CodeElement } from "../custom-types";
import { normalizeTokens } from "../utils/normalize-tokens";

import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { remarkToSlate } from "remark-slate-transformer";
import { withDOM } from "slate-vue3/dom";

const props = defineProps<{
  content: string;
}>();

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkToSlate);

const slateDescendant = processor.processSync(props.content).result;

const toChildren = (content: string) => [{ text: content }];
const toCodeLines = (content: string): Element[] =>
  content
    .split("\n")
    .map((line) => ({ type: "code-line", children: toChildren(line) }));

slateDescendant
  .filter((i) => i.type === "code")
  .forEach((code) => {
    code.children = toCodeLines(code.children[0].text);
  });

const editor = withDOM(createEditor());
editor.children = slateDescendant;
const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch ((element as any).type) {
    case "heading":
      return h("h" + element.depth, attributes, children);
    case "code":
      return h(
        CodeBlock,
        { ...useInheritRef(attributes), element },
        () => children,
      );
    case "list":
      return h(element.ordered ? "ol" : "ul", attributes, children);
    case "listItem":
      return h("li", attributes, children);
    case "link":
      return h("a", { href: (element as any).url, target: "_blank" }, children);
    case "blockquote":
      return h("blockquote", attributes, children);
    default:
      return h("p", attributes, children);
  }
};

const renderLeaf = ({ text, attributes, children, leaf }: RenderLeafProps) => {
  const style: CSSProperties = {};
  if (text.strong) {
    style.fontWeight = "bold";
  }
  if (text.emphasis) {
    style.fontStyle = "italic";
  }
  if (text.inlineCode) {
    style.backgroundColor = "rgb(234 234 235)";
    style.border = "1px solid rgb(229, 231, 235";
    style.borderRadius = "4px";
    style.padding = "0 4px";
  }
  if (text.delete) {
    style.textDecoration = "line-through";
  }
  const { text: _text, ...rest } = leaf;
  return h(
    "span",
    { ...attributes, style, class: Object.keys(rest).join(" ") },
    children,
  );
};

const decorationsMap = new Map();
const blockEntries = Editor.nodes(editor, {
  at: [],
  mode: "highest",
  match: (n) => Element.isElement(n) && n.type === "code",
});

Array.from(blockEntries).forEach(
  ([block, blockPath]: NodeEntry<CodeElement>) => {
    const text = block.children.map((line) => Node.string(line)).join("\n");
    const tokens = Prism.tokenize(text, Prism.languages[block.lang]);
    const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line

    for (let index = 0; index < normalizedTokens.length; index++) {
      const tokens = normalizedTokens[index];
      const element = block.children[index];

      if (!decorationsMap.has(element)) {
        decorationsMap.set(element, []);
      }

      let start = 0;
      for (const token of tokens) {
        const length = token.content.length;
        if (!length) {
          continue;
        }

        const end = start + length;

        const path = [...blockPath, index, 0];
        const range: Range = {
          anchor: { path, offset: start },
          focus: { path, offset: end },
          token: true,
          ...Object.fromEntries(token.types.map((type) => [type, true])),
        };

        decorationsMap.get(element)!.push(range);

        start = end;
      }
    }
  },
);

const decorate = ([node]: NodeEntry) => {
  if (Element.isElement(node) && node.type === "code-line") {
    return decorationsMap.get(node) || [];
  }
  return [];
};
</script>
<style>
.slate-markdown * {
  font-family: "Roboto", sans-serif;
}

.slate-markdown a {
  color: rgb(3, 102, 214);
  text-decoration: underline;
}

.slate-markdown a:hover {
  color: black;
}

.slate-markdown ul {
  padding-inline-start: 25px;
}

.slate-markdown ol {
  padding-inline-start: 25px;
}

.slate-markdown li {
  margin-bottom: 8px;
}

.slate-markdown h1 {
  margin-top: 10px;
  margin-bottom: 16px;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(209, 217, 224, 0.7);
}

.slate-markdown h2 {
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(209, 217, 224, 0.7);
}

.slate-markdown h4 {
  margin-top: 24px;
  margin-bottom: 16px;
}
</style>
