import { onMounted, onUnmounted, Ref } from "vue";
import { Editor, Path, Range, Text, Descendant } from "slate";
import { DOMEditor } from "slate-dom";
import { toRawWeakMap as WeakMap } from "share-tools";
import { JsonObject } from "@liveblocks/client";
import { CursorEditor, CursorState } from "../plugins/withCursors";
import { relativeRangeToSlateRange } from "../utils/position";

export function useOnResize<T extends HTMLElement>(
  _ref: Ref<T>,
  onResize: () => void
) {
  const observer = new ResizeObserver(onResize);

  onMounted(() => {
    _ref?.value && observer.observe(_ref.value);
  });
  onUnmounted(() => {
    _ref?.value && observer.unobserve(_ref.value);
  });
}

export type Store<T> = readonly [
  (onStoreChange: () => void) => () => void,
  () => T
];

const CHILDREN_TO_CURSOR_STATE_TO_RANGE: WeakMap<
  Descendant[],
  WeakMap<CursorState, Range | null>
> = new WeakMap();

export function getCursorRange<TCursorData extends JsonObject = JsonObject>(
  editor: CursorEditor<TCursorData>,
  cursorState: CursorState<TCursorData>
): Range | null {
  if (!cursorState.selection) {
    return null;
  }

  let cursorStates = CHILDREN_TO_CURSOR_STATE_TO_RANGE.get(editor.children);
  if (!cursorStates) {
    cursorStates = new WeakMap();
    CHILDREN_TO_CURSOR_STATE_TO_RANGE.set(editor.children, cursorStates);
  }

  let range: any = cursorStates.get(cursorState);
  if (range === undefined) {
    try {
      range = relativeRangeToSlateRange(
        editor.sharedRoot,
        editor,
        cursorState.selection
      );

      cursorStates.set(cursorState, range);
    } catch (e) {
      return null;
    }
  }

  return range;
}

export type SelectionRect = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export type CaretPosition = {
  height: number;
  top: number;
  left: number;
};

export type OverlayPosition = {
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
};

export type GetSelectionRectsOptions = {
  xOffset: number;
  yOffset: number;
  shouldGenerateOverlay?: (node: Text, path: Path) => boolean;
};

export function getOverlayPosition(
  editor: DOMEditor,
  range: Range,
  { yOffset, xOffset, shouldGenerateOverlay }: GetSelectionRectsOptions
): OverlayPosition {
  const [start, end] = Range.edges(range);
  const domRange = domEditorToDomRangeSafe(editor, range);
  if (!domRange) {
    return {
      caretPosition: null,
      selectionRects: [],
    };
  }

  const selectionRects: SelectionRect[] = [];
  const nodeIterator = Editor.nodes(editor, {
    at: range,
    match: (n, p) =>
      Text.isText(n) && (!shouldGenerateOverlay || shouldGenerateOverlay(n, p)),
  });

  let caretPosition: CaretPosition | null = null;
  const isBackward = Range.isBackward(range);
  for (const [node, path] of nodeIterator) {
    const domNode = DOMEditor.toDOMNode(editor, node);

    const isStartNode = Path.equals(path, start.path);
    const isEndNode = Path.equals(path, end.path);

    let clientRects: DOMRectList | null = null;
    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange();
      nodeRange.selectNode(domNode);

      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset);
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset);
      }

      clientRects = nodeRange.getClientRects();
    } else {
      clientRects = domNode.getClientRects();
    }

    const isCaret = isBackward ? isStartNode : isEndNode;
    for (let i = 0; i < clientRects.length; i++) {
      const clientRect = clientRects.item(i);
      if (!clientRect) {
        continue;
      }

      const isCaretRect =
        isCaret && (isBackward ? i === 0 : i === clientRects.length - 1);

      const top = clientRect.top - yOffset;
      const left = clientRect.left - xOffset;

      if (isCaretRect) {
        caretPosition = {
          height: clientRect.height,
          top,
          left:
            left +
            (isBackward || Range.isCollapsed(range) ? 0 : clientRect.width),
        };
      }

      selectionRects.push({
        width: clientRect.width,
        height: clientRect.height,
        top,
        left,
      });
    }
  }

  return {
    selectionRects,
    caretPosition,
  };
}

export function domEditorToDomRangeSafe(
  editor: DOMEditor,
  range: Range
): globalThis.Range | null {
  try {
    return DOMEditor.toDOMRange(editor, range);
  } catch (e) {
    return null;
  }
}
