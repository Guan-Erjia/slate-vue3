import { Editor, Range } from "slate";
import { IS_ANDROID, isDOMNode, type DOMEditor } from "slate-dom";
import scrollIntoView from "scroll-into-view-if-needed";
import type {
  RenderElementProps,
  RenderTextProps,
  RenderLeafProps,
  RenderPlaceholderProps,
  RenderChunkProps,
} from "../utils/interface";
import { h } from "vue";
/**
 * Check if an event is overrided by a handler.
 */
export const isEventHandled = <EventType extends Event>(
  event: EventType,
  handler?: (event: EventType) => void | boolean,
) => {
  if (!handler) {
    return false;
  }
  // 使用 attributes 上的 handler 调用，禁止模版绑定的 handler 重复调用
  event.stopImmediatePropagation();
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
  event: EventType,
) =>
  isDOMNode(event.target) &&
  (event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement);

/**
 * Check if a DOM event is overrided by a handler.
 */

export const isDOMEventHandled = <E extends Event>(
  event: E,
  handler?: (event: E) => void | boolean,
) => {
  if (!handler) {
    return false;
  }
  // 使用 attributes 上的 handler 调用，禁止模版绑定的 handler 重复调用
  event.stopImmediatePropagation();
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.defaultPrevented;
};

export const handleNativeHistoryEvents = (
  editor: Editor,
  event: InputEvent,
) => {
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
export const DEFAULT_SCROLL_INTO_VIEW = (
  editor: DOMEditor,
  domRange: globalThis.Range,
) => {
  // This was affecting the selection of multiple blocks and dragging behavior,
  // so enabled only if the selection has been collapsed.
  if (
    domRange.getBoundingClientRect &&
    (!editor.selection ||
      (editor.selection && Range.isCollapsed(editor.selection)))
  ) {
    const leafEl = domRange.startContainer.parentElement!;

    // COMPAT: In Chrome, domRange.getBoundingClientRect() can return zero dimensions for valid ranges (e.g. line breaks).
    // When this happens, do not scroll like most editors do.
    const domRect = domRange.getBoundingClientRect();
    const isZeroDimensionRect =
      domRect.width === 0 &&
      domRect.height === 0 &&
      domRect.x === 0 &&
      domRect.y === 0;

    if (isZeroDimensionRect) {
      const leafRect = leafEl.getBoundingClientRect();
      const leafHasDimensions = leafRect.width > 0 || leafRect.height > 0;

      if (leafHasDimensions) {
        return;
      }
    }
    // Default behavior: use domRange's getBoundingClientRect
    leafEl.getBoundingClientRect =
      domRange.getBoundingClientRect.bind(domRange);
    scrollIntoView(leafEl, {
      scrollMode: "if-needed",
    });
    // @ts-expect-error an unorthodox delete D:
    delete leafEl.getBoundingClientRect;
  }
};

export const DEFAULT_ELEMENT_RENDER = ({
  element,
  attributes,
  children,
  editor,
}: RenderElementProps) => {
  const tag = editor?.isInline(element) ? "span" : "div";
  return h(
    tag,
    {
      ...attributes,
      style: {
        position: "relative",
      },
    },
    children,
  );
};

export const DEFAULT_LEAF_RENDER = ({
  attributes,
  children,
}: RenderLeafProps) => h("span", attributes, children);

export const DEFAULT_TEXT_RENDER = ({
  attributes,
  children,
}: RenderTextProps) => h("span", attributes, children);

export const DEFAULT_CHUNK_RENDER = ({ children }: RenderChunkProps) =>
  children;

export const DEFAULT_PLACEHOLDER_RENDER = ({
  attributes,
  children,
}: RenderPlaceholderProps) =>
  h("span", attributes, [children, IS_ANDROID ? h("br") : undefined]);

export const DEFAULT_DECORATE_FN = () => [];
