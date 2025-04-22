// This package has made modifications to slate yjs
// https://github.com/BitPhinix/slate-yjs

import type { RelativeRange } from "./model/types";
import type {
  CursorEditor,
  CursorState,
  CursorStateChangeEvent,
  RemoteCursorChangeEventListener,
  WithCursorsOptions,
  WithYHistoryOptions,
  WithYjsOptions,
  YHistoryEditor,
} from "./plugins";
import { withCursors, withYHistory, withYjs, YjsEditor } from "./plugins";
import { slateNodesToInsertDelta, yTextToSlateElement } from "./utils/convert";
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from "./utils/position";

import { CursorStore, useRemoteCursorStates } from "./hooks/useRemoteCursorStates";
import { useUnsetCursorPositionOnBlur } from "./hooks/useUnsetCursorPositionOnBlur";
import { getCursorRange } from "./hooks/utils";

import {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from "./hooks/useRemoteCursorOverlayPositions";

export type {
  WithYjsOptions,
  // History plugin
  YHistoryEditor,
  WithYHistoryOptions,
  // Base cursor plugin
  CursorState,
  CursorStore,
  CursorEditor,
  CursorOverlayData,
  WithCursorsOptions,
  RemoteCursorChangeEventListener,
  CursorStateChangeEvent,
  // Utils
  RelativeRange,
};

export {
  YjsEditor,
  withYjs,
  withYHistory,
  withCursors,
  yTextToSlateElement,
  slateNodesToInsertDelta,
  slateRangeToRelativeRange,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  relativePositionToSlatePoint,
  useRemoteCursorStates,
  useUnsetCursorPositionOnBlur,
  useRemoteCursorOverlayPositions,
  getCursorRange,
};
