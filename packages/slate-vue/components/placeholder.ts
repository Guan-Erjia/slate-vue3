import { CSSProperties, defineComponent, ref, computed, VNodeRef } from "vue";
import { useRenderPlaceholder } from "../render/placeholder";
import { EDITOR_TO_PLACEHOLDER_ELEMENT, IS_WEBKIT } from "slate-vue3/dom";
import { useEditor } from "../hooks/use-editor";

const style: CSSProperties = {
  position: "absolute",
  top: 0,
  pointerEvents: "none",
  width: "100%",
  maxWidth: "100%",
  display: "block",
  opacity: "0.333",
  userSelect: "none",
  WebkitUserSelect: "none",
  textDecoration: "none",
  // Fixes https://github.com/udecode/plate/issues/2315
  WebkitUserModify: IS_WEBKIT ? "inherit" : undefined,
};

export const PlaceholderComp = defineComponent({
  name: "slate-placeholder",
  props: ["placeholder", "onPlaceholderResize"],
  setup(props: {
    placeholder?: string;
    onPlaceholderResize?: (node: HTMLElement | null) => void;
  }) {
    const editor = useEditor();
    const placeholderResizeObserver = ref<ResizeObserver>();
    const placeholderRef: VNodeRef = (ref) => {
      if (ref === null) {
        placeholderResizeObserver.value?.disconnect();
        placeholderResizeObserver.value = undefined;
        props.onPlaceholderResize?.(null);
        EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
        return;
      }

      if (ref instanceof HTMLElement) {
        placeholderResizeObserver.value?.observe(ref);
        props.onPlaceholderResize?.(ref);
        EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, ref);
      }
    };

    const attributes = computed(() => ({
      "data-slate-placeholder": true,
      "aria-hidden": true,
      style,
      contenteditable: false,
      ref: placeholderRef,
      onPlaceholderResize: props.onPlaceholderResize,
    }));

    const renderPlaceholder = useRenderPlaceholder();

    return () =>
      renderPlaceholder({
        children: props.placeholder,
        attributes: attributes.value,
      });
  },
});
