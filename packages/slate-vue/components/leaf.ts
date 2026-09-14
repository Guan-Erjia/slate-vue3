import { Text, LeafPosition } from "slate";
import { h, defineComponent, computed } from "vue";
import { StringComp } from "./string";
import { PlaceholderComp } from "./placeholder";
import { useRenderLeaf } from "../render/fn";
import { PLACEHOLDER_SYMBOL } from "slate-vue3/dom";

export const LeafComp = defineComponent({
  name: "slate-leaf",
  props: ["text", "leaf", "isLast", "leafPosition"],
  setup(props: {
    text: Text;
    leaf: Text;
    isLast: boolean;
    leafPosition?: LeafPosition;
  }) {
    const renderLeaf = useRenderLeaf();
    const showPlaceholder = computed(() => props.leaf[PLACEHOLDER_SYMBOL]);
    return () =>
      renderLeaf({
        text: props.text,
        leaf: props.leaf,
        leafPosition: props.leafPosition,
        attributes: { "data-slate-leaf": true },
        children: showPlaceholder.value
          ? [
              h(StringComp, {
                text: props.text,
                leaf: props.leaf,
                isLast: true,
              }),
              h(PlaceholderComp, {
                placeholder: props.leaf.placeholder,
                onPlaceholderResize: props.leaf.onPlaceholderResize,
              }),
            ]
          : h(StringComp, {
              text: props.text,
              leaf: props.leaf,
              isLast: props.isLast,
            }),
      });
  },
});
