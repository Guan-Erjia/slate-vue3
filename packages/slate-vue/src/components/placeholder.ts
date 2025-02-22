import {
  CSSProperties,
  defineComponent,
  VNode,
  ref,
  computed,
  PublicProps,
  HTMLAttributes,
  VNodeProps,
} from "vue";
import {
  usePlaceholderContext,
  useRenderPlaceholder,
} from "../hooks/use-render";
import { EDITOR_TO_PLACEHOLDER_ELEMENT, IS_WEBKIT } from "slate-dom";
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
  textDecoration: "none",
  // Fixes https://github.com/udecode/plate/issues/2315
  WebkitUserModify: IS_WEBKIT ? "inherit" : undefined,
};

export const PlaceholderComp = defineComponent({
  setup() {
    const editor = useEditor();
    const placeholderResizeObserver = ref<ResizeObserver>();
    const placeholderContext = usePlaceholderContext();

    const attributes = computed(() => ({
      "data-slate-placeholder": true,
      style,
      contenteditable: false,
      onVnodeMounted(vNode: VNode) {
        if (vNode.el) {
          EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, vNode.el);
          placeholderResizeObserver.value = new ResizeObserver(() => {
            placeholderContext.value?.onPlaceholderResize?.(vNode.el!);
          });
          placeholderResizeObserver.value.observe(vNode.el as HTMLElement);
        }
      },
      onVnodeUnmounted() {
        EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
        placeholderResizeObserver.value?.disconnect();
        placeholderResizeObserver.value = undefined;
      },
    }));

    const renderPlaceholder = useRenderPlaceholder();

    return () =>
      renderPlaceholder({
        children: placeholderContext.value?.placeholder,
        attributes: attributes.value,
      });
  },
});
