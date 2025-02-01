import { StringComp } from "./string";
import {
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  IS_WEBKIT,
  IS_ANDROID,
  NODE_TO_INDEX,
} from "slate-dom";
import type { LeafProps, RenderPlaceholderProps } from "./interface";
import {
  computed,
  defineComponent,
  Fragment,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import { useRenderLeaf, useRenderPlaceholder } from "../hooks/use-render";
import { useEditor } from "../hooks/use-editor";
import { Editor, Element } from "slate";

// Delay the placeholder on Android to prevent the keyboard from closing.
// (https://github.com/ianstormtaylor/slate/pull/5368)
const PLACEHOLDER_DELAY = IS_ANDROID ? 300 : 0;

/**
 * Individual leaves in a text node with unique formatting.
 */
export const LeafComp = defineComponent({
  name: "slate-leaf",
  props: ["text", "leaf", "parent", "leaves", "leafIndex"],
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
    const showPlaceholder = ref(false);
    const showPlaceholderTimeoutRef = ref<number>();
    const leafIsPlaceholder = computed(() =>
      Boolean(leaf.value[PLACEHOLDER_SYMBOL])
    );

    onMounted(() => {
      if (placeholderRef.value) {
        EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderRef.value);
        placeholderResizeObserver.value = new ResizeObserver(() => {
          leaf.value.onPlaceholderResize?.(placeholderRef.value);
        });
        placeholderResizeObserver.value.observe(placeholderRef.value);
      }

      if (leafIsPlaceholder.value) {
        showPlaceholderTimeoutRef.value = setTimeout(() => {
          showPlaceholder.value = true;
          showPlaceholderTimeoutRef.value = undefined;
        }, PLACEHOLDER_DELAY);
      }
    });

    onBeforeUnmount(() => {
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
      placeholderResizeObserver.value?.disconnect();
      placeholderResizeObserver.value = null;
      /** fixme 
        // leaf.value?.onPlaceholderResize?.(null);
       * this count be not right **/
      clearTimeout(showPlaceholderTimeoutRef.value!);
      showPlaceholderTimeoutRef.value = undefined;
    });

    const placeholderProps = computed<RenderPlaceholderProps>(() => ({
      children: leaf.value.placeholder,
      attributes: {
        "data-slate-placeholder": true,
        style: {
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
        },
        contentEditable: false,
        ref: placeholderRef,
      },
    }));

    const renderLeaf = useRenderLeaf();
    const renderPlaceholder = useRenderPlaceholder();

    const children = computed(() =>
      h(Fragment, null, [
        leafIsPlaceholder.value &&
          showPlaceholder.value &&
          renderPlaceholder(placeholderProps.value),
        h(StringComp, {
          isLast,
          leaf,
          parent,
          text,
        }),
      ])
    );

    // COMPAT: Having the `data-` attributes on these leaf elements ensures that
    // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
    // contenteditable behaviors. (2019/05/08)
    return () =>
      renderLeaf({
        attributes: { "data-slate-leaf": true },
        children: children.value,
        leaf: leaf.value,
        text,
      });
  },
});
