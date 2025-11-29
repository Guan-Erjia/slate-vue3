export * from "./utils/interface";

export { Slate } from "./components/slate";
export { Editable } from "./components/editable";

export * from "./components/utils";

// Hooks
export { useComposing } from "./hooks/use-composing";
export { useFocused } from "./hooks/use-focused";
export { useReadOnly } from "./hooks/use-read-only";
export { useSelected } from "./hooks/use-selected";
export { useEditor } from "./hooks/use-editor";
export { useSelection } from "./hooks/use-selection";
export { useInheritRef } from "./hooks/use-inherit-ref";
export { useElement, useElementIf } from "./hooks/use-element";

export { toRawWeakMap } from "share-tools";
