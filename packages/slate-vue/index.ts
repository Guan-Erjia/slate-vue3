export type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
  RenderTextProps,
  RenderChunkProps
} from "./utils/interface";

export { Slate } from "./components/slate";
export { Editable } from "./components/editable";

export {
  DEFAULT_ELEMENT_RENDER,
  DEFAULT_LEAF_RENDER,
  DEFAULT_TEXT_RENDER,
  DEFAULT_CHUNK_RENDER,
  DEFAULT_PLACEHOLDER_RENDER,
  DEFAULT_SCROLL_INTO_VIEW,
  DEFAULT_DECORATE_FN,
} from "./components/utils";

// Hooks
export { useComposing } from "./hooks/use-composing";
export { useFocused } from "./hooks/use-focused";
export { useReadOnly } from "./hooks/use-read-only";
export { useSelected } from "./hooks/use-selected";
export { useEditor } from "./hooks/use-editor";
export { useSelection } from "./hooks/use-selection";
export { useInheritRef } from "./hooks/use-inherit-ref";
export { useElement, useElementIf } from './hooks/use-element'

export { toRawWeakMap } from "share-tools";
