export type DOMElement = globalThis.Element;
export type DOMNode = globalThis.Node;
export type DOMRange = globalThis.Range;
export type DOMSelection = globalThis.Selection;
export type DOMStaticRange = globalThis.StaticRange;
export type DOMText = globalThis.Text;

export type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from "./components/interface";

export { Slate } from "./components/slate";
export { Editable } from "./components/editable";

export { defaultRenderLeaf } from "./components/utils"
export { defaultRenderPlaceHolder } from "./components/utils"

// Hooks
export { useComposing } from "./hooks/use-composing";
export { useFocused } from "./hooks/use-focused";
export { useReadOnly } from "./hooks/use-read-only";
export { useSelected } from "./hooks/use-selected";
export { useEditor } from "./hooks/use-editor";
export { useSelection } from "./hooks/use-selection";


