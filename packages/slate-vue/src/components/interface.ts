import type {
  DecoratedRange,
  NodeEntry,
  Text,
  Element,
  Ancestor,
  Range,
  BaseText,
} from "slate";
import type { DOMEditor } from "slate-dom";
import type { JSX } from "vue/jsx-runtime";
import type {
  ComputedRef,
  CSSProperties,
  HTMLAttributes,
  VNode,
  VNodeRef,
} from "vue";

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
  selection: ComputedRef<Range | null>;
  decorations: ComputedRef<DecoratedRange[]>;
}

export interface TextProps {
  parent: Element;
  text: Text;
  parentDecorations: ComputedRef<DecoratedRange[]>;
}

export interface StringProps {
  isLast: ComputedRef<boolean>;
  text: Text;
  leaf: ComputedRef<Text>;
  parent: Element;
}

export interface ElementProps {
  element: Element;
  childSelection: ComputedRef<Range | null>;
  childDecorations: ComputedRef<DecoratedRange[]>;
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
  parent: Element;
  leafIndex: number;
  leaves: ComputedRef<
    (BaseText & {
      [key: string]: unknown;
      placeholder?: string;
      onPlaceholderResize?: (node: HTMLElement | null) => void;
    })[]
  >;
}
