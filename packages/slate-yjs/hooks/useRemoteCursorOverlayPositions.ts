import { computed, onUpdated, ref, Ref } from "vue";
import { BaseRange, NodeMatch, Text } from "slate";
import { DOMEditor } from "slate-dom";
import { useEditor } from "slate-vue";
import { CursorEditor, CursorState } from "../plugins/withCursors";
import {
  CaretPosition,
  getOverlayPosition,
  OverlayPosition,
  SelectionRect,
  useOnResize,
  getCursorRange,
} from "./utils";
import { useRemoteCursorStates } from "./useRemoteCursorStates";
import { toRawWeakMap as WeakMap } from "share-tools";

const FROZEN_EMPTY_ARRAY = Object.freeze([]);

export type CursorOverlayData<TCursorData extends Record<string, unknown>> =
  CursorState<TCursorData> & {
    range: BaseRange | null;
    caretPosition: CaretPosition | null;
    selectionRects: SelectionRect[];
  };

export function useRemoteCursorOverlayPositions<
  TCursorData extends Record<string, unknown>,
  TContainer extends HTMLElement = HTMLDivElement
>(containerRef: Ref<TContainer>, shouldGenerateOverlay?: NodeMatch<Text>) {
  const editor = useEditor() as CursorEditor<TCursorData> & DOMEditor;
  const cursorStates = useRemoteCursorStates<TCursorData>();

  const overlayPositionCache = ref(new WeakMap<BaseRange, OverlayPosition>());
  const overlayPositions = ref<Record<string, OverlayPosition>>({});

  useOnResize(containerRef, () => (overlayPositionCache.value = new WeakMap()));

  // Update selection rects after paint
  onUpdated(() => {
    // We have a container ref but the ref is null => container
    // isn't mounted to we can't calculate the selection rects.
    if (!containerRef.value) {
      return;
    }

    const containerRect = containerRef.value.getBoundingClientRect();
    const xOffset = containerRect?.x ?? 0;
    const yOffset = containerRect?.y ?? 0;

    let overlayPositionsChanged =
      Object.keys(overlayPositions.value).length !==
      Object.keys(cursorStates.value).length;

    const updated = Object.fromEntries(
      Object.entries(cursorStates.value).map(([key, state]) => {
        const range = state.relativeSelection && getCursorRange(editor, state);

        if (!range) {
          return [key, FROZEN_EMPTY_ARRAY];
        }

        const cached = overlayPositionCache.value.get(range);
        if (cached) {
          return [key, cached];
        }

        const overlayPosition = getOverlayPosition(editor, range, {
          xOffset,
          yOffset,
          shouldGenerateOverlay,
        });
        overlayPositionsChanged = true;
        overlayPositionCache.value.set(range, overlayPosition);
        return [key, overlayPosition];
      })
    );

    if (overlayPositionsChanged) {
      overlayPositions.value = updated;
    }
  });

  const overlayData = computed<CursorOverlayData<TCursorData>[]>(() =>
    Object.entries(cursorStates.value).map(([clientId, state]) => {
      const range = state.relativeSelection && getCursorRange(editor, state);
      const overlayPosition = overlayPositions.value[clientId];

      return {
        ...state,
        range,
        caretPosition: overlayPosition?.caretPosition ?? null,
        selectionRects: overlayPosition?.selectionRects ?? FROZEN_EMPTY_ARRAY,
      };
    })
  );

  const refresh = () => (overlayPositionCache.value = new WeakMap());

  return [overlayData, refresh] as const;
}
