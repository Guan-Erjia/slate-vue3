import {
  CSSProperties,
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
} from "vue";
import { useRenderPlaceholder } from "../render/placeholder";
import { IS_WEBKIT } from "slate-vue3/dom";

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
  props: ["placeholder", "onPlaceholderResize"],
  setup(props: {
    placeholder?: string;
    onPlaceholderResize?: (height?: number) => void;
  }) {
    const placeholderResizeObserver = ref<ResizeObserver>();
    const placeholderRef = ref<HTMLElement>();

    onMounted(() => {
      placeholderResizeObserver.value = new ResizeObserver(() => {
        props.onPlaceholderResize?.(
          placeholderRef.value?.getBoundingClientRect()?.height,
        );
      });
      placeholderResizeObserver.value.observe(
        placeholderRef.value as HTMLElement,
      );
    });

    onUnmounted(() => {
      placeholderResizeObserver.value?.disconnect();
      placeholderResizeObserver.value = undefined;
      props.onPlaceholderResize?.();
    });

    const attributes = computed(() => ({
      "data-slate-placeholder": true,
      style,
      contenteditable: false,
      ref: placeholderRef,
    }));

    const renderPlaceholder = useRenderPlaceholder();

    return () =>
      renderPlaceholder({
        children: props.placeholder,
        attributes: attributes.value,
      });
  },
});
