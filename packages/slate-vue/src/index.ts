// Components
export type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from "./components/interface";

export { Slate } from "./components/slate";
export { Editable } from "./components/editable";

// Hooks
export { useComposing } from "./hooks/use-composing";
export { useFocused } from "./hooks/use-focused";
export { useReadOnly } from "./hooks/use-read-only";
export { useSelected } from "./hooks/use-selected";
export { useEditor } from "./hooks/use-editor";
export { useSelection } from "./hooks/use-selection";
