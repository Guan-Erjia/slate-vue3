import type { Text, Element, LeafPosition, Editor } from "slate";
import type {
  CSSProperties,
  HTMLAttributes,
  VNode,
  VNodeChild,
  VNodeRef,
} from "vue";

/**
 * `RenderChunkProps` are passed to the `renderChunk` handler
 */
export interface RenderChunkProps {
  highest: boolean;
  lowest: boolean;
  children: VNode;
  attributes: {
    "data-slate-chunk": true;
    key: string;
  };
}

/**
 * The props that get passed to renderPlaceholder
 */
export interface RenderPlaceholderProps {
  children?: string;
  attributes: {
    "data-slate-placeholder": boolean;
    "aria-hidden": boolean;
    dir?: "rtl";
    contenteditable: boolean;
    ref: VNodeRef;
    style: CSSProperties;
  };
}

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */
export interface RenderLeafProps {
  children: VNodeChild[] | VNode;
  /**
   * The leaf node with any applied decorations.
   * If no decorations are applied, it will be identical to the `text` property.
   */
  leaf: Text;
  text: Text;
  attributes: HTMLAttributes & {
    "data-slate-leaf": true;
  };
  /**
   * The position of the leaf within the Text node, only present when the text node is split by decorations.
   */
  leafPosition?: LeafPosition;
}

/**
 * `RenderElementProps` are passed to the `renderElement` handler.
 */
export interface RenderElementProps {
  children: VNode | VNodeChild[];
  element: Element;
  attributes: HTMLAttributes & {
    "data-slate-node": "element";
    "data-slate-inline"?: true;
    "data-slate-void"?: true;
    dir?: "rtl";
    ref: VNodeRef;
  };
  editor?: Editor;
}

/**
 * `RenderTextProps` are passed to the `renderText` handler.
 */
export interface RenderTextProps {
  text: Text;
  children: VNode | VNodeChild[];
  attributes: {
    "data-slate-node": "text";
    ref: VNodeRef;
  };
}
