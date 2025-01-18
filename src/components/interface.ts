import type {
  DecoratedRange,
  NodeEntry,
  Text,
  Element,
  Ancestor,
  Range,
  Path,
  Descendant,
} from "slate";
import type { DOMEditor, DOMRange } from "slate-dom";
import type { JSX } from "vue/jsx-runtime";
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
  attributes: {
    "data-slate-leaf": true;
  };
}

/**
 * `RenderElementProps` are passed to the `renderElement` handler.
 */
export interface RenderElementProps {
  children: VNode;
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
export interface EditableProps extends HTMLAttributes {
  decorate: (entry: NodeEntry) => DecoratedRange[];
  onDOMBeforeInput?: (event: InputEvent) => void;
  role?: string;
  readOnly: boolean;
  placeholder?: string;
  style?: CSSProperties;
  renderElement: (props: RenderElementProps) => VNode;
  renderLeaf: (props: RenderLeafProps) => VNode;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
  scrollSelectionIntoView: (editor: DOMEditor, domRange: DOMRange) => void;
  is: string;
}

export interface ChildrenProps {
  node: Ancestor;
  renderElement: (props: RenderElementProps) => JSX.Element;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
  renderLeaf: (props: RenderLeafProps) => JSX.Element;
  selection: Range | null;
  decorations: DecoratedRange[];
  editor: DOMEditor;
}

export interface TextProps {
  isLast: boolean;
  parent: Element;
  text: Text;
  parentPath: Path;
  parentDecorations: DecoratedRange[];
  renderLeaf: (props: RenderLeafProps) => JSX.Element;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
  editor: DOMEditor;
  index: number;
}

export interface StringProps {
  isLast: boolean;
  text: Text;
  leaf: Text;
  parent: Element;
  editor: DOMEditor;
}

export interface ElementProps {
  element: Element;
  renderElement: (props: RenderElementProps) => JSX.Element;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
  renderLeaf: (props: RenderLeafProps) => JSX.Element;
  editor: DOMEditor;
  parentPath: Path;
  parentSelection: Range | null;
  parentDecorations: DecoratedRange[];
  index: number;
}

export interface SlateProps {
  initialValue: Descendant[];
}

export interface LeafProps {
  text: Text;
  leaf: Text;
  parent: Element;
  isLast: boolean;
  renderLeaf: (props: RenderLeafProps) => VNode;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
  editor: DOMEditor;
}
