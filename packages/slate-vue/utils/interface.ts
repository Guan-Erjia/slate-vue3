import type { Text, Element, LeafPosition, Editor } from "slate";
import type { HTMLAttributes, VNode, VNodeArrayChildren, VNodeChild, VNodeProps, VNodeRef } from "vue";

/**
 * `RenderChunkProps` are passed to the `renderChunk` handler
 */
export interface RenderChunkProps {
  highest: boolean
  lowest: boolean
  children: any
  attributes: {
    'data-slate-chunk': true
  }
}

/**
 * The props that get passed to renderPlaceholder
 */
export interface RenderPlaceholderProps {
  children?: string;
  attributes: HTMLAttributes &
    VNodeProps & {
      "data-slate-placeholder": boolean;
      dir?: "rtl";
    };
}

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */
export interface RenderLeafProps {
  children: VNodeArrayChildren;
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
  leafPosition?: LeafPosition
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
  editor?: Editor
}

/**
 * `RenderTextProps` are passed to the `renderText` handler.
 */
export interface RenderTextProps {
  text: Text
  children: VNodeChild[];
  attributes: {
    'data-slate-node': 'text'
    ref: VNodeRef
  }
}