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

import { useRemoteCursorStates } from "./hooks/useRemoteCursorStates";
import { useUnsetCursorPositionOnBlur } from "./hooks/useUnsetCursorPositionOnBlur";
import { getCursorRange } from "./hooks/utils";

import {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from "./hooks/useRemoteCursorOverlayPositions";
import {
  getRemoteCaretsOnLeaf,
  getRemoteCursorsOnLeaf,
  REMOTE_CURSOR_CARET_DECORATION_PREFIX,
  REMOTE_CURSOR_DECORATION_PREFIX,
  RemoteCaretDecoratedRange,
  RemoteCaretDecoration,
  RemoteCursorDecoratedRange,
  RemoteCursorDecoration,
  TextWithRemoteCursors,
  useDecorateRemoteCursors,
  UseDecorateRemoteCursorsOptions,
} from "./hooks/useDecorateRemoteCursors";

export type {
  WithYjsOptions,
  // History plugin
  YHistoryEditor,
  WithYHistoryOptions,
  // Base cursor plugin
  CursorState,
  CursorEditor,
  CursorOverlayData,
  WithCursorsOptions,
  RemoteCursorChangeEventListener,
  CursorStateChangeEvent,
  // Utils
  RelativeRange,
  UseDecorateRemoteCursorsOptions,
  RemoteCursorDecoration,
  RemoteCaretDecoration,
  RemoteCursorDecoratedRange,
  RemoteCaretDecoratedRange,
  TextWithRemoteCursors,
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
  getRemoteCursorsOnLeaf,
  getRemoteCaretsOnLeaf,
  useDecorateRemoteCursors,
  REMOTE_CURSOR_DECORATION_PREFIX,
  REMOTE_CURSOR_CARET_DECORATION_PREFIX,
};
