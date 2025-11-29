import { CSSProperties, defineComponent, VNode, ref, computed } from "vue";
import {
  usePlaceholder,
  usePlaceholderResize,
  useRenderPlaceholder,
} from "../render/placeholder";
import { IS_WEBKIT } from "slate-dom";

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
  name: "slate-placeholder",
  setup() {
    const placeholder = usePlaceholder();
    const onPlaceholderResize = usePlaceholderResize();

    const placeholderResizeObserver = ref<ResizeObserver>();
    const attributes = computed(() => ({
      "data-slate-placeholder": true,
      style,
      contenteditable: false,
      onVnodeMounted(vNode: VNode) {
        if (vNode.el) {
          placeholderResizeObserver.value = new ResizeObserver(() => {
            onPlaceholderResize(vNode.el?.getBoundingClientRect()?.height);
          });
          placeholderResizeObserver.value.observe(vNode.el as HTMLElement);
        }
      },
      onVnodeUnmounted() {
        placeholderResizeObserver.value?.disconnect();
        placeholderResizeObserver.value = undefined;
        onPlaceholderResize();
      },
    }));

    const renderPlaceholder = useRenderPlaceholder();

    return () =>
      renderPlaceholder({
        children: placeholder.value,
        attributes: attributes.value,
      });
  },
});
