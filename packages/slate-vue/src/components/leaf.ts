import { StringComp } from "./string";
import { NODE_TO_INDEX } from "slate-dom";
import type { LeafProps } from "./interface";
import { computed, defineComponent, Fragment, h } from "vue";
import { usePlaceholderContext, useRenderLeaf } from "../hooks/use-render";
import { useEditor } from "../hooks/use-editor";
import { Editor, Element } from "slate";
import { PlaceholderComp } from "./placeholder";

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

    const renderLeaf = useRenderLeaf();

    // COMPAT: Having the `data-` attributes on these leaf elements ensures that
    // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
    // contenteditable behaviors. (2019/05/08)
    const placeholderContext = usePlaceholderContext();
    return () =>
      renderLeaf({
        text,
        leaf: leaf.value,
        attributes: { "data-slate-leaf": true },
        children: h(Fragment, [
          placeholderContext.value && h(PlaceholderComp),
          h(StringComp, {
            isLast,
            leaf,
            parent,
            text,
          }),
        ]),
      });
  },
});
