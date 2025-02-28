import { CSSProperties, defineComponent, VNode, ref, computed } from "vue";
import { useRenderPlaceholder } from "../hooks/use-render";
import { EDITOR_TO_PLACEHOLDER_ELEMENT, IS_WEBKIT } from "slate-dom";
import { useEditor } from "../hooks/use-editor";
import { Node } from "slate";
import { useComposing } from "../hooks/use-composing";

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
    onPlaceholderResize: (height?: number) => void;
  }) {
    const editor = useEditor();
    const placeholderResizeObserver = ref<ResizeObserver>();
    const isComposing = useComposing();

    const showPlaceholder = computed(
      () =>
        props.placeholder &&
        editor.children?.length === 1 &&
        Array.from(Node.texts(editor)).length === 1 &&
        Node.string(editor) === "" &&
        !isComposing.value
    );

    const attributes = computed(() => ({
      "data-slate-placeholder": true,
      style,
      contenteditable: false,
      onVnodeMounted(vNode: VNode) {
        if (vNode.el) {
          EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, vNode.el);
          placeholderResizeObserver.value = new ResizeObserver(() => {
            props.onPlaceholderResize(
              vNode.el?.getBoundingClientRect()?.height
            );
          });
          placeholderResizeObserver.value.observe(vNode.el as HTMLElement);
        }
      },
      onVnodeUnmounted() {
        EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
        placeholderResizeObserver.value?.disconnect();
        placeholderResizeObserver.value = undefined;
        props.onPlaceholderResize();
      },
    }));

    const renderPlaceholder = useRenderPlaceholder();

    return () =>
      showPlaceholder.value &&
      renderPlaceholder({
        children: props.placeholder,
        attributes: attributes.value,
      });
  },
});
