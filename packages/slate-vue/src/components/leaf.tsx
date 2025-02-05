import { StringComp } from "./string";
import {
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  IS_WEBKIT,
  IS_ANDROID,
  NODE_TO_INDEX,
} from "slate-dom";
import type { LeafProps } from "./interface";
import {
  computed,
  CSSProperties,
  defineComponent,
  Fragment,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import {
  usePlaceholderContext,
  useRenderLeaf,
  useRenderPlaceholder,
} from "../hooks/use-render";
import { useEditor } from "../hooks/use-editor";
import { Editor, Element } from "slate";


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
/**
 * Individual leaves in a text node with unique formatting.
 */
export const LeafComp = defineComponent({
  name: "slate-leaf",
  props: ["text", "parent", "leaves", "leafIndex"],
  setup(props: LeafProps) {
    const { text, parent, leaves, leafIndex } = props;
    const editor = useEditor();
    const leaf = computed(() => leaves.value[leafIndex]!);

    const isLast = computed(() => {
      const isVoid = Editor.isVoid(editor, parent);
      const isLeafBlock =
        Element.isElement(parent) &&
        !editor.isInline(parent) &&
        Editor.hasInlines(editor, parent);

      return (
        !isVoid &&
        isLeafBlock &&
        NODE_TO_INDEX.get(text) === parent.children.length - 1 &&
        leafIndex === leaves.value.length - 1
      );
    });

    const placeholderResizeObserver = ref<ResizeObserver | null>(null);
    const placeholderRef = ref<HTMLElement | null>(null);
    const placeholderContext = usePlaceholderContext();

    onMounted(() => {
      if (placeholderRef.value) {
        EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderRef.value);
        placeholderResizeObserver.value = new ResizeObserver(() => {
          placeholderRef.value &&
            placeholderContext.value?.onPlaceholderResize?.(
              placeholderRef.value
            );
        });
        placeholderResizeObserver.value.observe(placeholderRef.value);
      }
    });

    onBeforeUnmount(() => {
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
      placeholderResizeObserver.value?.disconnect();
      placeholderResizeObserver.value = null;
    });

    const renderLeaf = useRenderLeaf();
    const renderPlaceholder = useRenderPlaceholder();

    // COMPAT: Having the `data-` attributes on these leaf elements ensures that
    // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
    // contenteditable behaviors. (2019/05/08)
    return () =>
      renderLeaf({
        attributes: { "data-slate-leaf": true },
        children: h(Fragment, null, [
          placeholderContext.value &&
            renderPlaceholder({
              children: placeholderContext.value.placeholder,
              attributes: {
                "data-slate-placeholder": true,
                style,
                contentEditable: false,
                ref: placeholderRef,
              },
            }),
          h(StringComp, {
            isLast,
            leaf,
            parent,
            text,
          }),
        ]),
        leaf: leaf.value,
        text,
      });
  },
});
