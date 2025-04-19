import { computed, getCurrentInstance, onUpdated, ref, Ref } from "vue";
import { BaseRange, NodeMatch, Text } from "slate";
import { CursorState } from "../plugins/withCursors";
import {
  CaretPosition,
  getOverlayPosition,
  OverlayPosition,
  SelectionRect,
  useOnResize,
  getCursorRange,
} from "./utils";
import { useRemoteCursorEditor } from "./useRemoteCursorEditor";
import { useRemoteCursorStates } from "./useRemoteCursorStates";

const FROZEN_EMPTY_ARRAY = Object.freeze([]);

export type UseRemoteCursorOverlayPositionsOptions<T extends HTMLElement> = {
  shouldGenerateOverlay?: NodeMatch<Text>;
  containerRef: Ref<T>;
};

export type CursorOverlayData<TCursorData extends Record<string, unknown>> =
  CursorState<TCursorData> & {
    range: BaseRange | null;
    caretPosition: CaretPosition | null;
    selectionRects: SelectionRect[];
  };

export function useRemoteCursorOverlayPositions<
  TCursorData extends Record<string, unknown>,
  TContainer extends HTMLElement = HTMLDivElement
>({
  containerRef,
  shouldGenerateOverlay,
}: UseRemoteCursorOverlayPositionsOptions<TContainer>) {
  const editor = useRemoteCursorEditor<TCursorData>();
  const cursorStates = useRemoteCursorStates<TCursorData>();
  const proxy = getCurrentInstance();
  const requestRerender = proxy?.update;

  const overlayPositionCache = ref(new WeakMap<BaseRange, OverlayPosition>());
  const overlayPositions = ref<Record<string, OverlayPosition>>({});

  useOnResize(containerRef, () => {
    overlayPositionCache.value = new WeakMap();
    requestRerender?.();
  });

  // Update selection rects after paint
  onUpdated(() => {
    // We have a container ref but the ref is null => container
    // isn't mounted to we can't calculate the selection rects.
    if (containerRef && !containerRef.value) {
      return;
    }

    const containerRect = containerRef?.value?.getBoundingClientRect();
    const xOffset = containerRect?.x ?? 0;
    const yOffset = containerRect?.y ?? 0;

    let overlayPositionsChanged =
      Object.keys(overlayPositions).length !== Object.keys(cursorStates).length;

    const updated = Object.fromEntries(
      Object.entries(cursorStates).map(([key, state]) => {
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
    Object.entries(cursorStates).map(([clientId, state]) => {
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

  const refresh = () => {
    overlayPositionCache.value = new WeakMap();
    requestRerender?.();
  };

  return [overlayData, refresh] as const;
}
