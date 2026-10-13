import { Text, LeafPosition, Element } from "slate";
import { h, defineComponent, computed, ref, watch } from "vue";
import { StringComp } from "./string";
import { useRenderLeaf } from "../render/fn";
import { PLACEHOLDER_SYMBOL, IS_ANDROID } from "slate-vue3/dom";
import { PlaceholderComp } from "./placeholder";

// (https://github.com/ianstormtaylor/slate/pull/5368)
const PLACEHOLDER_DELAY = IS_ANDROID ? 300 : 0;

type TimerId = ReturnType<typeof setTimeout> | null;

export const LeafComp = defineComponent({
  name: "slate-leaf",
  props: ["isLast", "leaf", "parent", "text", "leafPosition"],
  setup(props: {
    leaf: Text;
    isLast: boolean;
    text: Text;
    parent: Element;
    leafPosition?: LeafPosition;
  }) {
    const renderLeaf = useRenderLeaf();

    let showPlaceholderTimeoutRef: TimerId = null;
    const showPlaceholder = ref(false);

    const leafIsPlaceholder = computed(() =>
      Boolean(props.leaf[PLACEHOLDER_SYMBOL]),
    );

    const clearTimeoutRef = () => {
      if (showPlaceholderTimeoutRef) {
        clearTimeout(showPlaceholderTimeoutRef);
        showPlaceholderTimeoutRef = null;
      }
    };
    watch(
      leafIsPlaceholder,
      (isPlaceholder) => {
        if (isPlaceholder) {
          if (!showPlaceholderTimeoutRef) {
            showPlaceholderTimeoutRef = setTimeout(() => {
              showPlaceholder.value = true;
              showPlaceholderTimeoutRef = null;
            }, PLACEHOLDER_DELAY);
          }
        } else {
          clearTimeoutRef();
          showPlaceholder.value = false;
        }
      },
      { immediate: true },
    );

    return () => {
      const children = h(StringComp, {
        text: props.text,
        leaf: props.leaf,
        isLast: props.isLast,
        parent: props.parent,
      });

      return renderLeaf({
        text: props.text,
        leaf: props.leaf,
        leafPosition: props.leafPosition,
        attributes: { "data-slate-leaf": true },
        children:
          leafIsPlaceholder.value && showPlaceholder.value
            ? [
                children,
                h(PlaceholderComp, {
                  placeholder: props.leaf.placeholder,
                  onPlaceholderResize: props.leaf.onPlaceholderResize,
                }),
              ]
            : children,
      });
    };
  },
});
