import { BaseEditor, Editor, Point } from "slate";
import * as Y from "yjs";
import { applyYjsEvents } from "../applyToSlate";
import { applySlateOp } from "../applyToYjs";
import { yTextToSlateElement } from "../utils/convert";
import {
  getStoredPosition,
  getStoredPositions,
  relativePositionToSlatePoint,
  removeStoredPosition,
  setStoredPosition,
  slatePointToRelativePosition,
} from "../utils/position";
import { assertDocumentAttachment } from "../utils/yjs";
import { toRawWeakMap as WeakMap } from "share-tools";

const DEFAULT_LOCAL_ORIGIN = Symbol("slate-yjs-operation");
const DEFAULT_POSITION_STORAGE_ORIGIN = Symbol("slate-yjs-position-storage");

const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();
const CONNECTED: WeakSet<Editor> = new WeakSet();

export type YjsEditor = BaseEditor & {
  sharedRoot: Y.XmlText;

  localOrigin: unknown;
  positionStorageOrigin: unknown;

  applyRemoteEvents: (events: Y.YEvent<Y.XmlText>[], origin: unknown) => void;

  isLocalOrigin: (origin: unknown) => boolean;

  connect: () => void;
  disconnect: () => void;
};

export const YjsEditor = {
  isYjsEditor(value: unknown): value is YjsEditor {
    return (
      Editor.isEditor(value) &&
      (value as YjsEditor).sharedRoot instanceof Y.XmlText &&
      "localOrigin" in value &&
      "positionStorageOrigin" in value &&
      typeof (value as YjsEditor).applyRemoteEvents === "function" &&
      typeof (value as YjsEditor).isLocalOrigin === "function" &&
      typeof (value as YjsEditor).connect === "function" &&
      typeof (value as YjsEditor).disconnect === "function"
    );
  },

  applyRemoteEvents(
    editor: YjsEditor,
    events: Y.YEvent<Y.XmlText>[],
    origin: unknown
  ): void {
    editor.applyRemoteEvents(events, origin);
  },

  connected(editor: YjsEditor): boolean {
    return CONNECTED.has(editor);
  },

  connect(editor: YjsEditor): void {
    editor.connect();
  },

  disconnect(editor: YjsEditor): void {
    editor.disconnect();
  },

  isLocal(editor: YjsEditor): boolean {
    return editor.isLocalOrigin(YjsEditor.origin(editor));
  },

  origin(editor: YjsEditor): unknown {
    const origin = ORIGIN.get(editor);
    return origin !== undefined ? origin : editor.localOrigin;
  },

  withOrigin(editor: YjsEditor, origin: unknown, fn: () => void): void {
    const prev = YjsEditor.origin(editor);
    ORIGIN.set(editor, origin);
    fn();
    ORIGIN.set(editor, prev);
  },

  storePosition(editor: YjsEditor, key: string, point: Point): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    const position = slatePointToRelativePosition(sharedRoot, editor, point);

    sharedRoot.doc.transact(() => {
      setStoredPosition(sharedRoot, key, position);
    }, locationStorageOrigin);
  },

  removeStoredPosition(editor: YjsEditor, key: string): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    sharedRoot.doc.transact(() => {
      removeStoredPosition(sharedRoot, key);
    }, locationStorageOrigin);
  },

  position(editor: YjsEditor, key: string): Point | null | undefined {
    const position = getStoredPosition(editor.sharedRoot, key);
    if (!position) {
      return undefined;
    }

    return relativePositionToSlatePoint(editor.sharedRoot, editor, position);
  },

  storedPositionsRelative(
    editor: YjsEditor
  ): Record<string, Y.RelativePosition> {
    return getStoredPositions(editor.sharedRoot);
  },
};

export type WithYjsOptions = {
  autoConnect?: boolean;

  // Origin used when applying local slate operations to yjs
  localOrigin?: unknown;

  // Origin used when storing positions
  positionStorageOrigin?: unknown;
};

export function withYjs<T extends Editor>(
  editor: T,
  sharedRoot: Y.XmlText,
  {
    localOrigin,
    positionStorageOrigin,
    autoConnect = false,
  }: WithYjsOptions = {}
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedRoot = sharedRoot;

  e.localOrigin = localOrigin ?? DEFAULT_LOCAL_ORIGIN;
  e.positionStorageOrigin =
    positionStorageOrigin ?? DEFAULT_POSITION_STORAGE_ORIGIN;

  e.applyRemoteEvents = (events, origin) => {
    Editor.withoutNormalizing(e, () => {
      YjsEditor.withOrigin(e, origin, () => {
        applyYjsEvents(e.sharedRoot, e, events);
      });
    });
  };

  e.isLocalOrigin = (origin) => origin === e.localOrigin;

  const handleYEvents = (
    events: Y.YEvent<Y.XmlText>[],
    transaction: Y.Transaction
  ) => {
    if (e.isLocalOrigin(transaction.origin)) {
      return;
    }

    YjsEditor.applyRemoteEvents(e, events, transaction.origin);
  };

  let autoConnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  if (autoConnect) {
    autoConnectTimeoutId = setTimeout(() => {
      autoConnectTimeoutId = null;
      YjsEditor.connect(e);
    });
  }

  e.connect = () => {
    if (YjsEditor.connected(e)) {
      throw new Error("already connected");
    }

    e.sharedRoot.observeDeep(handleYEvents);
    const content = yTextToSlateElement(e.sharedRoot);
    e.children = content.children;
    CONNECTED.add(e);

    Editor.normalize(editor, { force: true });
    if (!editor.operations.length) {
      editor.onChange();
    }
  };

  e.disconnect = () => {
    if (autoConnectTimeoutId) {
      clearTimeout(autoConnectTimeoutId);
    }

    e.sharedRoot.unobserveDeep(handleYEvents);
    CONNECTED.delete(e);
  };

  const { apply } = e;
  e.apply = (op) => {
    if (YjsEditor.connected(e) && YjsEditor.isLocal(e)) {
      assertDocumentAttachment(e.sharedRoot);
      const localChanges =
        // fixme
        // 这里的调度顺序有问题
        // flushLocalChanges 时，由于 slate-vue3 没有使用 immer 锁定，children 已随着更新
        // 需要使用深拷贝切断指针，有性能问题
        // 后续需要使用浅拷贝，只切断部分指针
        { op, doc: editor.children, origin: YjsEditor.origin(e) };

      e.sharedRoot.doc.transact(() => {
        assertDocumentAttachment(e.sharedRoot);
        applySlateOp(
          e.sharedRoot,
          { children: localChanges.doc },
          localChanges.op
        );
      }, localChanges.origin);
    }
    apply(op);
  };

  return e;
}
