import { Editor, Range } from "slate";
import { compareRelativePositions } from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { JsonObject } from "@liveblocks/client";
import { RelativeRange } from "../model/types";
import { slateRangeToRelativeRange } from "../utils/position";
import { YjsEditor } from "./withYjs";

export type CursorStateChangeEvent = {
  added: number[];
  updated: number[];
  removed: number[];
};

export type RemoteCursorChangeEventListener = (
  event: CursorStateChangeEvent,
) => void;

const CURSOR_CHANGE_EVENT_LISTENERS: WeakMap<
  Editor,
  Set<RemoteCursorChangeEventListener>
> = new WeakMap();

export type CursorState<TCursorData extends JsonObject = JsonObject> = {
  selection: RelativeRange | null;
  data?: TCursorData;
};

export type CursorEditor<TCursorData extends JsonObject = JsonObject> =
  YjsEditor & {
    awareness: LiveblocksYjsProvider["awareness"];

    cursorDataField: string;
    selectionStateField: string;

    sendCursorPosition: (range: Range | null) => void;
    sendCursorData: (data: TCursorData) => void;
  };

export const CursorEditor = {
  isCursorEditor(value: unknown): value is CursorEditor {
    return (
      YjsEditor.isYjsEditor(value) &&
      (value as CursorEditor).awareness &&
      typeof (value as CursorEditor).cursorDataField === "string" &&
      typeof (value as CursorEditor).selectionStateField === "string" &&
      typeof (value as CursorEditor).sendCursorPosition === "function" &&
      typeof (value as CursorEditor).sendCursorData === "function"
    );
  },

  sendCursorPosition<TCursorData extends JsonObject>(
    editor: CursorEditor<TCursorData>,
    range: Range | null = editor.selection,
  ) {
    editor.sendCursorPosition(range);
  },

  sendCursorData<TCursorData extends JsonObject>(
    editor: CursorEditor<TCursorData>,
    data: TCursorData,
  ) {
    editor.sendCursorData(data);
  },

  on<TCursorData extends JsonObject>(
    editor: CursorEditor<TCursorData>,
    event: "change",
    handler: RemoteCursorChangeEventListener,
  ) {
    if (event !== "change") {
      return;
    }

    const listeners = CURSOR_CHANGE_EVENT_LISTENERS.get(editor) ?? new Set();
    listeners.add(handler);
    CURSOR_CHANGE_EVENT_LISTENERS.set(editor, listeners);
  },

  off<TCursorData extends JsonObject>(
    editor: CursorEditor<TCursorData>,
    event: "change",
    listener: RemoteCursorChangeEventListener,
  ) {
    if (event !== "change") {
      return;
    }

    const listeners = CURSOR_CHANGE_EVENT_LISTENERS.get(editor);
    if (listeners) {
      listeners.delete(listener);
    }
  },

  cursorState<TCursorData extends JsonObject>(
    editor: CursorEditor<TCursorData>,
    clientId: number,
  ): CursorState<TCursorData> | null {
    if (
      clientId === editor.sharedRoot.doc?.clientID ||
      !YjsEditor.connected(editor)
    ) {
      return null;
    }

    const state = editor.awareness.getStates().get(clientId) as {
      data: TCursorData;
      selection: RelativeRange | null;
    };
    if (!state) {
      return null;
    }

    return {
      selection: state.selection ?? null,
      data: state.data,
    };
  },

  cursorStates<TCursorData extends JsonObject>(
    editor: CursorEditor<TCursorData>,
  ): Record<string, CursorState<TCursorData>> {
    if (!YjsEditor.connected(editor)) {
      return {};
    }
    return Object.fromEntries(
      Array.from(
        (editor.awareness.getStates() as Map<number, CursorState>).entries(),
        ([id, state]) => {
          // Ignore own state
          if (id === editor.sharedRoot.doc?.clientID || !state) {
            return null;
          }

          return [
            id,
            {
              selection: state.selection,
              data: state.data,
            },
          ];
        },
      ).filter(Array.isArray),
    );
  },
};

export type WithCursorsOptions<TCursorData extends JsonObject = JsonObject> = {
  // Local state field used to store the user selection
  cursorStateField?: string;

  // Local state field used to store data attached to the local client
  cursorDataField?: string;

  data?: TCursorData;
  autoSend?: boolean;
};

export function withCursors<
  TCursorData extends JsonObject,
  TEditor extends YjsEditor,
>(
  editor: TEditor,
  awareness: LiveblocksYjsProvider["awareness"],
  {
    cursorStateField: selectionStateField = "selection",
    cursorDataField = "data",
    autoSend = true,
    data,
  }: WithCursorsOptions<TCursorData> = {},
): TEditor & CursorEditor<TCursorData> {
  const e = editor as TEditor & CursorEditor<TCursorData>;

  e.awareness = awareness;
  e.cursorDataField = cursorDataField;
  e.selectionStateField = selectionStateField;

  e.sendCursorData = (cursorData: JsonObject) => {
    e.awareness.setLocalStateField(e.cursorDataField, cursorData);
  };

  e.sendCursorPosition = (range) => {
    const localState = e.awareness.getLocalState() as CursorState;
    const currentRange = localState.selection;

    if (!range) {
      if (currentRange) {
        e.awareness.setLocalStateField(e.selectionStateField, null);
      }

      return;
    }

    const relativeRange = slateRangeToRelativeRange(e.sharedRoot, e, range);

    if (
      !currentRange ||
      !compareRelativePositions(relativeRange.anchor, currentRange.anchor) ||
      !compareRelativePositions(relativeRange.focus, currentRange.focus)
    ) {
      e.awareness.setLocalStateField(
        e.selectionStateField,
        relativeRange as unknown as JsonObject,
      );
    }
  };

  const awarenessChangeListener: RemoteCursorChangeEventListener = (yEvent) => {
    const listeners = CURSOR_CHANGE_EVENT_LISTENERS.get(e);
    if (!listeners) {
      return;
    }

    const localId = e.sharedRoot.doc?.clientID;
    const event = {
      added: yEvent.added.filter((id) => id !== localId),
      removed: yEvent.removed.filter((id) => id !== localId),
      updated: yEvent.updated.filter((id) => id !== localId),
    };

    if (
      event.added.length > 0 ||
      event.removed.length > 0 ||
      event.updated.length > 0
    ) {
      listeners.forEach((listener) => listener(event));
    }
  };

  const { connect, disconnect } = e;
  e.connect = () => {
    connect();

    e.awareness.on("change", awarenessChangeListener);

    awarenessChangeListener({
      removed: [],
      added: Array.from(e.awareness.getStates().keys()),
      updated: [],
    });

    if (autoSend) {
      if (data) {
        CursorEditor.sendCursorData(e, data);
      }

      const { onChange } = e;
      e.onChange = () => {
        onChange();

        if (YjsEditor.connected(e)) {
          CursorEditor.sendCursorPosition(e);
        }
      };
    }
  };

  e.disconnect = () => {
    e.awareness.off("change", awarenessChangeListener);

    awarenessChangeListener({
      removed: Array.from(e.awareness.getStates().keys()),
      added: [],
      updated: [],
    });

    disconnect();
  };

  return e;
}
