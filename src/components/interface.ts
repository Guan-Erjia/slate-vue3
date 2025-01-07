import type { DecoratedRange, NodeEntry, Text, Element } from "slate";
import type { DOMRange } from "../slate-dom";
import type { JSX } from "vue/jsx-runtime";
import type { DOMEditor } from "../plugin/react-editor";
import type { CSSProperties, HTMLAttributes, VNode, VNodeRef } from "vue";

/**
 * The props that get passed to renderPlaceholder
 */
export type RenderPlaceholderProps = {
  children: any;
  attributes: {
    "data-slate-placeholder": boolean;
    dir?: "rtl";
    contentEditable: boolean;
    ref: VNodeRef;
    style: CSSProperties;
  };
};

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */
export interface RenderLeafProps {
  children: JSX.Element;
  leaf: Text;
  text: Text;
  attributes: {
    "data-slate-leaf": true;
  };
}

/**
 * `RenderElementProps` are passed to the `renderElement` handler.
 */

export interface RenderElementProps {
  children: any;
  element: Element;
  attributes: {
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

export type EditableProps = {
  decorate: (entry: NodeEntry) => DecoratedRange[];
  onDOMBeforeInput?: (event: InputEvent) => void;
  placeholder?: string;
  readOnly: boolean;
  role?: string;
  style: CSSProperties;
  renderElement: (props: RenderElementProps) => VNode;
  renderLeaf: (props: RenderLeafProps) => VNode;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
  scrollSelectionIntoView: (editor: DOMEditor, domRange: DOMRange) => void;
  as: string;
} & HTMLAttributes;
