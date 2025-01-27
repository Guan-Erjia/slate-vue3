import { Range } from "slate";
import { IS_ANDROID, isDOMNode, type DOMEditor, type DOMRange } from "slate-dom";
import scrollIntoView from "scroll-into-view-if-needed";
import type { RenderLeafProps, RenderPlaceholderProps } from "./interface";
import { h } from "vue";
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

export const defaultRenderLeaf = ({ attributes, children, }: RenderLeafProps) => {
  return h(
    "span",
    attributes,
    children
  )
}

export const defaultRenderPlaceHolder = ({ attributes, children }: RenderPlaceholderProps) => {
  return h('span', attributes, [
    children,
    IS_ANDROID ? h('br') : undefined
  ])
}