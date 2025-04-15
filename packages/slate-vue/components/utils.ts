import { Editor, Range } from "slate";
import { IS_ANDROID, isDOMNode, type DOMEditor } from "slate-dom";
import scrollIntoView from "scroll-into-view-if-needed";
import type { RenderLeafProps, RenderPlaceholderProps } from "../utils/interface";
import { h } from "vue";
/**
 * Check if an event is overrided by a handler.
 */
export const isEventHandled = <EventType extends Event>(
  event: EventType,
  handler?: (event: EventType) => void | boolean
) => {
  if (!handler) {
    return false;
  }
  // 使用 attributes 上的 handler 调用，禁止模版绑定的 handler 重复调用
  event.stopImmediatePropagation()
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }
  return event.defaultPrevented || !event.bubbles;
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
  // 使用 attributes 上的 handler 调用，禁止模版绑定的 handler 重复调用
  event.stopImmediatePropagation()
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.defaultPrevented;
};

export const handleNativeHistoryEvents = (editor: Editor, event: InputEvent) => {
  if (
    event.inputType === "historyUndo" &&
    "undo" in editor &&
    typeof editor.undo === "function"
  ) {
    editor.undo();
  }
  if (
    event.inputType === "historyRedo" &&
    "redo" in editor &&
    typeof editor.redo === "function"
  ) {
    editor.redo();
  }
};

/**
 * A default implement to scroll dom range into view.
 */
export const defaultScrollSelectionIntoView = (
  editor: DOMEditor,
  domRange: globalThis.Range
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