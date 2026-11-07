<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  createReactiveEditor,
} from "slate-vue3";
import { h, ref, type VNodeChild } from "vue";
import { isHotkey } from "is-hotkey";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { remarkToSlate, slateToRemark } from "remark-slate-transformer";
import { Editor, Element, Path, Transforms, type Descendant } from "slate";
import { withHistory } from "slate-history";
import { unified } from "unified";

const parser = unified().use(remarkParse).use(remarkToSlate);
const serializer = unified().use(remarkStringify);

const emptyDocument: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

const toSlate = (markdown: string): Descendant[] => {
  const value = parser.processSync(markdown).result as Descendant[];
  return value.length ? value : emptyDocument;
};

const toMarkdown = (value: Descendant[]) =>
  serializer.stringify(slateToRemark(value));

type Mark = "strong" | "emphasis" | "inlineCode";

const HOTKEYS: Record<string, Mark> = {
  "mod+b": "strong",
  "mod+i": "emphasis",
  "mod+`": "inlineCode",
};

const INLINE_TYPES = new Set([
  "link",
  "image",
  "break",
  "linkReference",
  "imageReference",
  "footnoteReference",
  "inlineMath",
]);

const VOID_TYPES = new Set([
  "image",
  "break",
  "thematicBreak",
  "definition",
  "imageReference",
  "footnoteReference",
]);

const withMdast = <T extends Editor>(editor: T): T => {
  const { isInline, isVoid, insertBreak } = editor;

  editor.isInline = (element) =>
    INLINE_TYPES.has(element.type as string) || isInline(element);

  editor.isVoid = (element) =>
    VOID_TYPES.has(element.type as string) || isVoid(element);

  editor.insertBreak = () => {
    const listItem = Editor.above(editor, {
      match: (node) => Element.isElement(node) && node.type === "listItem",
    });

    if (listItem) {
      const [, listItemPath] = listItem;
      const nextPath = Path.next(listItemPath);
      const nextListItem: Descendant = {
        type: "listItem",
        children: [{ type: "paragraph", children: [{ text: "" }] }],
      };
      Transforms.insertNodes(editor, nextListItem, { at: nextPath });
      Transforms.select(editor, Editor.end(editor, nextPath));
      return;
    }

    insertBreak();
  };

  return editor;
};

const toggleMark = (editor: Editor, mark: Mark) => {
  const marks = Editor.marks(editor);
  if (marks?.[mark]) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
};

const initialMarkdown = `# Markdown sync

Edit either side. The editor and the Markdown stay in step, with **strong**, *emphasis* and \`inline code\` marks.

* Lists keep their items
* Enter in a list item starts a new one

> Links like [Slate](https://docs.slatejs.org) stay inline.

\`\`\`
Code blocks keep their text.
\`\`\`
`;

const editor = withMdast(withHistory(createReactiveEditor()));

const markdown = ref(initialMarkdown);
const value = ref<Descendant[]>(toSlate(initialMarkdown));

const editValue = (next: Descendant[]) => {
  value.value = next;
  markdown.value = toMarkdown(next);
};

const editMarkdown = (event: Event) => {
  const text = (event.target as HTMLTextAreaElement).value;
  markdown.value = text;
  value.value = toSlate(text);
};

const onKeyDown = (event: KeyboardEvent) => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault();
      toggleMark(editor, HOTKEYS[hotkey]);
    }
  }
};

type MdastElement = {
  type: string;
  depth?: number;
  ordered?: boolean;
  start?: number;
  url?: string;
  alt?: string;
  inline?: boolean;
};

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const node = element as unknown as MdastElement;
  switch (node.type) {
    case "heading":
      return h(`h${node.depth}`, attributes, children);
    case "blockquote":
      return h("blockquote", attributes, children);
    case "list":
      return node.ordered
        ? h("ol", { ...attributes, start: node.start ?? undefined }, children)
        : h("ul", attributes, children);
    case "listItem":
      return h("li", attributes, children);
    case "code":
      return h("pre", attributes, h("code", null, children));
    case "html":
      return node.inline
        ? h("code", attributes, children)
        : h("pre", attributes, children);
    case "link":
      return h("a", { ...attributes, href: node.url }, children);
    case "image":
      return h("span", attributes, [
        h("img", {
          contenteditable: "false",
          src: node.url,
          alt: node.alt ?? "",
          style: "max-width: 100%",
        }),
        children,
      ]);
    case "break":
      return h("span", attributes, [
        h("br", { contenteditable: "false" }),
        children,
      ]);
    case "thematicBreak":
      return h("div", attributes, [
        h("hr", { contenteditable: "false" }),
        children,
      ]);
    default:
      return h("p", attributes, children);
  }
};

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  let next: VNodeChild = children;
  if (leaf.inlineCode) next = h("code", null, next);
  if (leaf.strong) next = h("strong", null, next);
  if (leaf.emphasis) next = h("em", null, next);
  if (leaf.delete) next = h("del", null, next);
  return h("span", attributes, next);
};
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
    <Slate
      :editor
      :value
      @valuechange="editValue(editor.children)"
      :render-element="renderElement"
      :render-leaf="renderLeaf"
    >
      <Editable aria-label="Rich text editor" @keydown="onKeyDown" />
    </Slate>
    <textarea
      aria-label="Markdown"
      :value="markdown"
      spellcheck="false"
      style="
        min-height: 320px;
        font-family: monospace;
        font-size: 14px;
        padding: 8px;
        resize: vertical;
      "
      @input="editMarkdown"
    />
  </div>
</template>
