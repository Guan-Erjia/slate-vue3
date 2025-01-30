import type {
  DecoratedRange,
  NodeEntry,
  Text,
  Element,
  Ancestor,
  Range,
  Path,
} from "slate";
import type { DOMEditor } from "slate-dom";
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
  onDOMBeforeInput?: (event: InputEvent) => void;
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
  selection: Range | null;
  decorations: DecoratedRange[];
}

export interface TextProps {
  isLast: boolean;
  parent: Element;
  text: Text;
  parentPath: Path;
  parentDecorations: DecoratedRange[];
  index: number;
}

export interface StringProps {
  isLast: boolean;
  text: Text;
  leaf: Text;
  parent: Element;
}

export interface ElementProps {
  element: Element;
  parentPath: Path;
  parentSelection: Range | null;
  parentDecorations: DecoratedRange[];
  index: number;
}

export interface SlateProps {
  editor: DOMEditor;
  decorate: (entry: NodeEntry) => DecoratedRange[];
  renderElement: (props: RenderElementProps) => VNode;
  renderLeaf: (props: RenderLeafProps) => VNode;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
}

export interface LeafProps {
  text: Text;
  leaf: Text;
  parent: Element;
  isLast: boolean;
}
