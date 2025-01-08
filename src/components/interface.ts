import {
  type DecoratedRange,
  type NodeEntry,
  type Text,
  type Element,
  Range,
  Operation,
} from "slate";
import type { DOMRange } from "../slate-dom";
import type { JSX } from "vue/jsx-runtime";
import type { DOMEditor } from "../plugin/react-editor";
import type { CSSProperties, HTMLAttributes, VNode, VNodeRef } from "vue";

/**
 * The props that get passed to renderPlaceholder
 */
export type RenderPlaceholderProps = {
  children?: string;
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
export type EditableProps = {
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
} & HTMLAttributes;

import { isDOMNode } from "../slate-dom";
import scrollIntoView from "scroll-into-view-if-needed";

/**
 * Check if an event is overrided by a handler.
 */
export const isEventHandled = <EventType extends Event>(
  event: any,
  handler?: (event: EventType) => void | boolean
) => {
  if (!handler) {
    return false;
  }
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.isDefaultPrevented() || event.isPropagationStopped();
};

/**
 * Check if the event's target is an input element
 */
export const isDOMEventTargetInput = <EventType extends Event>(
  event: EventType
) =>
  isDOMNode(event.target) &&
  (event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement);

/**
 * Check if a DOM event is overrided by a handler.
 */

export const isDOMEventHandled = <E extends Event>(
  event: E,
  handler?: (event: E) => void | boolean
) => {
  if (!handler) {
    return false;
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.defaultPrevented;
};

/**
 * A default implement to scroll dom range into view.
 */
export const defaultScrollSelectionIntoView = (
  editor: DOMEditor,
  domRange: DOMRange
) => {
  // This was affecting the selection of multiple blocks and dragging behavior,
  // so enabled only if the selection has been collapsed.
  if (
    domRange.getBoundingClientRect &&
    (!editor.selection ||
      (editor.selection && Range.isCollapsed(editor.selection)))
  ) {
    const leafEl = domRange.startContainer.parentElement!;
    leafEl.getBoundingClientRect =
      domRange.getBoundingClientRect.bind(domRange);
    scrollIntoView(leafEl, {
      scrollMode: "if-needed",
    });
    // @ts-expect-error an unorthodox delete D:
    delete leafEl.getBoundingClientRect;
  }
};

export const EDITOR_TO_EDITABLE_ON_CHANGE = new WeakMap<
  DOMEditor,
  (options?: { operation?: Operation }) => void
>();
