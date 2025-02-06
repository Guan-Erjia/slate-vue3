import type { DecoratedRange, NodeEntry, Text, Element, Ancestor } from "slate";
import type { DOMEditor } from "slate-dom";
import type { CSSProperties, HTMLAttributes, VNode, VNodeRef } from "vue";

/**
 * The props that get passed to renderPlaceholder
 */
export interface RenderPlaceholderProps {
  children?: string;
  attributes: {
    "data-slate-placeholder": boolean;
    dir?: "rtl";
    contentEditable: boolean;
    ref: VNodeRef;
    style: CSSProperties;
  };
}

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */
export interface RenderLeafProps {
  children: VNode;
  leaf: Text;
  text: Text;
  attributes: HTMLAttributes & {
    "data-slate-leaf": true;
  };
}

/**
 * `RenderElementProps` are passed to the `renderElement` handler.
 */
export interface RenderElementProps {
  children: VNode;
  element: Element;
  attributes: HTMLAttributes & {
    "data-slate-node": "element";
    "data-slate-inline"?: true;
    "data-slate-void"?: true;
    dir?: "rtl";
    ref: any;
  };
}

/**
 * `EditableProps` are passed to the `<Editable>` component.
 */
export interface EditableProps extends HTMLAttributes {
  role?: string;
  readOnly: boolean;
  placeholder?: string;
  style?: CSSProperties;
  scrollSelectionIntoView: (
    editor: DOMEditor,
    domRange: globalThis.Range
  ) => void;
  is: string;
}

export interface ChildrenProps {
  node: Ancestor;
}

export interface TextProps {
  parent: Element;
  text: Text;
}

export interface StringProps {
  isLastIndex: boolean;
  text: Text;
  leaf: Text;
  parent: Element;
}

export interface ElementProps {
  element: Element;
}

export interface SlateProps {
  editor: DOMEditor;
  decorate: (entry: NodeEntry) => DecoratedRange[];
  renderElement: (props: RenderElementProps) => VNode;
  renderLeaf: (props: RenderLeafProps) => VNode;
  renderPlaceholder: (props: RenderPlaceholderProps) => VNode;
}

export interface LeafProps {
  text: Text;
  parent: Element;
  leaf: Text;
  isLastIndex: boolean;
}
