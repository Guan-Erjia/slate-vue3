// Plugin
export { DOMEditor, type DOMEditorInterface } from './plugin/dom-editor'
export { withDOM } from './plugin/with-dom'

// Utils
export { applyStringDiff, normalizeStringDiff } from './utils/diff-text'
export type { StringDiff, TextDiff } from './utils/diff-text'

export {
  getActiveElement,
  getDefaultView,
  getSelection,
  hasShadowRoot,
  isAfter,
  isBefore,
  isDOMElement,
  isDOMNode,
  isDOMSelection,
  isPlainTextOnlyPaste,
  isTrackedMutation,
  normalizeDOMPoint,
} from './utils/dom'
export type { DOMPoint } from './utils/dom'

export {
  CAN_USE_DOM,
  HAS_BEFORE_INPUT_SUPPORT,
  IS_ANDROID,
  IS_CHROME,
  IS_FIREFOX,
  IS_FIREFOX_LEGACY,
  IS_IOS,
  IS_WEBKIT,
  IS_UC_MOBILE,
  IS_WECHATBROWSER,
} from './utils/environment'

export { Hotkeys } from './utils/hotkeys'

export { Key } from './utils/key'

export {
  isElementDecorationsEqual,
  isTextDecorationsEqual,
} from './utils/range-list'

export {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_ON_CHANGE,
  EDITOR_TO_USER_MARKS,
  EDITOR_TO_USER_SELECTION,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  IS_FOCUSED,
  IS_READ_ONLY,
  MARK_PLACEHOLDER_SYMBOL,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_KEY,
  NODE_TO_PARENT,
} from './utils/weak-maps'
