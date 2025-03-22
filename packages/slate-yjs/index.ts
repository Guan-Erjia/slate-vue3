import { type RelativeRange } from "./model/types";
import {
  type CursorEditor,
  type CursorState,
  type CursorStateChangeEvent,
  type RemoteCursorChangeEventListener,
  withCursors,
  type WithCursorsOptions,
  withYHistory,
  type WithYHistoryOptions,
  withYjs,
  type WithYjsOptions,
  type YHistoryEditor,
  YjsEditor,
} from "./plugins";
import { slateNodesToInsertDelta, yTextToSlateElement } from "./utils/convert";
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from "./utils/position";

export {
  withYjs,
  WithYjsOptions,
  YjsEditor,
  // History plugin
  withYHistory,
  WithYHistoryOptions,
  YHistoryEditor,
  // Base cursor plugin
  CursorEditor,
  WithCursorsOptions,
  withCursors,
  CursorState,
  RemoteCursorChangeEventListener,
  CursorStateChangeEvent,
  // Utils
  RelativeRange,
  yTextToSlateElement,
  slateNodesToInsertDelta,
  slateRangeToRelativeRange,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  relativePositionToSlatePoint,
};
