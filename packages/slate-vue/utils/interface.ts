import type { Text, Element } from "slate";
import type { HTMLAttributes, VNode, VNodeProps } from "vue";

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
