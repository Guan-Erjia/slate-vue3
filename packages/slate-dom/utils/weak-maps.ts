import {
  Ancestor,
  Editor,
  Node,
  Operation,
  Point,
  Range,
  RangeRef,
  Text,
} from "slate";
import { Key } from "./key";
import { toRawWeakMap } from "share-tools";

export type Action = { at?: Point | Range; run: () => void };

/**
 * Two weak maps that allow us rebuild a path given a node. They are populated
 * at render time such that after a render occurs we can always backtrack.
 */
export const NODE_TO_INDEX: WeakMap<Node, number> = new WeakMap();
export const NODE_TO_PARENT: WeakMap<Node, Ancestor> = new WeakMap();

/**
 * Weak maps that allow us to go between Slate nodes and DOM nodes. These
 * are used to resolve DOM event-related logic into Slate actions.
 */
export const EDITOR_TO_WINDOW = new WeakMap<Editor, Window>();
export const EDITOR_TO_ELEMENT = new WeakMap<Editor, HTMLElement>();
export const ELEMENT_TO_NODE = new WeakMap<HTMLElement, Node>();
export const NODE_TO_ELEMENT = new WeakMap<Node, HTMLElement>();
export const NODE_TO_KEY = new toRawWeakMap<Node, Key>();
export const EDITOR_TO_KEY_TO_ELEMENT = new WeakMap<
  Editor,
  WeakMap<Key, HTMLElement>
>();

/**
 * Weak maps for storing editor-related state.
 */

export const IS_READ_ONLY = new WeakMap<Editor, boolean>();
export const IS_FOCUSED = new WeakMap<Editor, boolean>();
export const IS_COMPOSING = new WeakMap<Editor, boolean>();

export const EDITOR_TO_USER_SELECTION = new WeakMap<Editor, RangeRef | null>();

/**
 * Weak map for associating the context `onChange` context with the plugin.
 */

export const EDITOR_TO_ON_CHANGE = new WeakMap<
  Editor,
  (options?: { operation?: Operation }) => void
>();

export const EDITOR_TO_USER_MARKS: WeakMap<Editor, Partial<Text> | null> =
  new WeakMap();

export const MARK_PLACEHOLDER_SYMBOL = Symbol(
  "mark-placeholder",
) as unknown as string;
