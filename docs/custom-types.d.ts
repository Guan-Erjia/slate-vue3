/// <reference types="vite/client" />
import { Descendant, BaseEditor, BaseRange, BaseText } from "slate-vue3/core";
import { DOMEditor } from "slate-vue3/dom";

export type BlockQuoteElement = {
  type: "blockquote";
  align?: string;
  children: Descendant[];
};

export type BlockElement = {
  type: "block";
  align?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: "bulleted-list";
  align?: string;
  children: Descendant[];
};

export type NumberedListElement = {
  type: "numbered-list";
  align?: string;
  children: Descendant[];
};

export type CheckListItemElement = {
  type: "check-list-item";
  checked: boolean;
  children: Descendant[];
};

export type EditableVoidElement = {
  type: "editable-void";
  children: EmptyText[];
};

export type HeadingElement = {
  type: "heading";
  depth: number;
  children: Descendant[];
};

export type ImageElement = {
  type: "image";
  url: string;
  children: EmptyText[];
};

export type LinkElement = { type: "link"; url: string; children: Descendant[] };

export type ButtonElement = { type: "button"; children: Descendant[] };

export type BadgeElement = { type: "badge"; children: Descendant[] };

export type ListElement = {
  type: "list";
  children: Descendant[];
  ordered: "ol" | "ul";
};

export type ListItemElement = {
  type: "list-item" | "listItem";
  children: Descendant[];
};

export type MentionElement = {
  type: "mention";
  character: string;
  children: CustomText[];
};

export type ParagraphElement = {
  type: "paragraph";
  align?: string;
  children: Descendant[];
};

export type TableElement = { type: "table"; children: Descendant[] };

export type TableCellElement = { type: "table-cell"; children: CustomText[] };

export type TableRowElement = { type: "table-row"; children: Descendant[] };

export type TitleElement = { type: "title"; children: Descendant[] };

export type VideoElement = {
  type: "video";
  url: string;
  children: EmptyText[];
};

export type CodeBlockElement = {
  type: "code-block";
  language: string;
  children: Descendant[];
};

export type CodeElement = {
  type: "code";
  language: string;
  lang: string;
  children: Descendant[];
};

export type CodeLineElement = {
  type: "code-line";
  children: Descendant[];
};

export type CustomElement =
  | BlockQuoteElement
  | BlockElement
  | BulletedListElement
  | NumberedListElement
  | CheckListItemElement
  | EditableVoidElement
  | HeadingElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | BadgeElement
  | ListElement
  | ListItemElement
  | MentionElement
  | ParagraphElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | TitleElement
  | VideoElement
  | CodeBlockElement
  | CodeElement
  | CodeLineElement;

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strong?: boolean;
  emphasis?: boolean;
  inlineCode?: boolean;
  delete?: boolean;
  underlined?: boolean;
  title?: boolean;
  list?: boolean;
  hr?: boolean;
  blockquote?: boolean;
};

export type EmptyText = {
  text: string;
};

export type CustomEditor = BaseEditor & DOMEditor;

declare module "slate-vue3/core" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}

declare module "*.md" {
  const src: string;
  export default src;
}
