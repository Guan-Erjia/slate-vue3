import {
  CSSProperties,
  defineComponent,
  VNode,
  ref,
  computed,
  onMounted,
  nextTick,
} from "vue";
import {
  usePlaceholder,
  usePlaceholderResize,
  useRenderPlaceholder,
} from "../hooks/use-render";
import { EDITOR_TO_ELEMENT, IS_WEBKIT } from "slate-dom";
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
    const editor = useEditor();

    onMounted(() => {
      nextTick(() => {
        /*
         * https://github.com/vuejs/core/issues/8444#issuecomment-1577843668
         * 由于 vue3 渲染列表边界产生空节点问题，点击的时候会优先选中空节点
         * 目前没想到好的方式解决，只能先用这种方法清除多余的空节点
         * 尽管这个问题只在 firefox 出现，但由于性能开销比较小，所以不做浏览器判断
         */
        const element = EDITOR_TO_ELEMENT.get(editor).querySelector(
          "[data-slate-placeholder]"
        ) as HTMLElement;
        for (const node of element.childNodes) {
          if (node.nodeType === 3 && node.textContent === "") {
            element.removeChild(node);
          }
        }
      });
    });

    return () =>
      renderPlaceholder({
        children: placeholder.value,
        attributes: attributes.value,
      });
  },
});
