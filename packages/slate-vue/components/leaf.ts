import { Text, LeafPosition } from "slate";
import { h, computed, defineComponent } from "vue";
import { StringComp } from "./string";
import { usePlaceholderShow } from "../render/placeholder";
import { PlaceholderComp } from "./placeholder";
import { useRenderLeaf } from "../render/fn";

export const LeafComp = defineComponent({
  name: "slate-leaf",
  props: ["text", "leaf", "isLast", "leafPosition"],
  setup(props: {
    text: Text;
    leaf: Text;
    isLast: boolean;
    leafPosition?: LeafPosition;
  }) {
    const text = props.text;
    const leaf = props.leaf;
    const isLast = props.isLast;
    const leafPosition = props.leafPosition;

    const renderLeaf = useRenderLeaf();
    const showPlaceholder = usePlaceholderShow();

    const children = computed(() => {
      return showPlaceholder.value
        ? [
            h(StringComp, {
              text,
              leaf,
              isLast: true,
            }),
            h(PlaceholderComp),
          ]
        : h(StringComp, {
            text,
            leaf,
            isLast,
          });
    });

    return () =>
      renderLeaf({
        text,
        leaf,
        leafPosition,
        attributes: { "data-slate-leaf": true },
        children: children.value,
      });
  },
});
