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

import {
  RemoteCursorDecoration,
  RemoteCursorDecoratedRange,
  RemoteCaretDecoration,
  RemoteCaretDecoratedRange,
  TextWithRemoteCursors,
  UseDecorateRemoteCursorsOptions,
  getRemoteCursorsOnLeaf,
  getRemoteCaretsOnLeaf,
  useDecorateRemoteCursors,
} from "./hooks/useDecorateRemoteCursors";

import {
  useRemoteCursorStatesSelector,
  useRemoteCursorStates,
} from "./hooks/useRemoteCursorStates";
import { useUnsetCursorPositionOnBlur } from "./hooks/useUnsetCursorPositionOnBlur";
import { getCursorRange } from "./hooks/utils";

import {
  CursorOverlayData,
  UseRemoteCursorOverlayPositionsOptions,
  useRemoteCursorOverlayPositions,
} from "./hooks/useRemoteCursorOverlayPositions";

export type {
  WithYjsOptions,
  // History plugin
  YHistoryEditor,
  WithYHistoryOptions,
  // Base cursor plugin
  CursorEditor,
  WithCursorsOptions,
  CursorState,
  RemoteCursorChangeEventListener,
  CursorStateChangeEvent,
  // Utils
  RelativeRange,
  RemoteCursorDecoration,
  RemoteCursorDecoratedRange,
  RemoteCaretDecoration,
  RemoteCaretDecoratedRange,
  TextWithRemoteCursors,
  UseDecorateRemoteCursorsOptions,
  CursorOverlayData,
  UseRemoteCursorOverlayPositionsOptions,
};

export {
  YjsEditor,
  getRemoteCursorsOnLeaf,
  getRemoteCaretsOnLeaf,
  useDecorateRemoteCursors,
  withYjs,
  withYHistory,
  withCursors,
  yTextToSlateElement,
  slateNodesToInsertDelta,
  slateRangeToRelativeRange,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  relativePositionToSlatePoint,
  useRemoteCursorStatesSelector,
  useRemoteCursorStates,
  useUnsetCursorPositionOnBlur,
  getCursorRange,
  useRemoteCursorOverlayPositions,
};
