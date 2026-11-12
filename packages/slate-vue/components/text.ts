import { Text } from "slate";
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from "slate-vue3/dom";
import {
  h,
  defineComponent,
  renderList,
  onUpdated,
  computed,
  shallowRef,
  watch,
  VNodeRef,
} from "vue";
import { useEditor } from "../hooks/use-editor";
import { useDecorations } from "../hooks/use-decorations";
import { isTextParentEquivalent } from "../utils/text-parent";
import { LeafComp } from "./leaf";
import { RenderTextProps, TextProps } from "../utils/interface";
import { useRenderProps } from "../render/fn";

export const TextComp = defineComponent({
  name: "slate-text",
  props: ["text", "isLast", "decorations", "parent"],
  setup(props: TextProps) {
    const editor = useEditor();
    const textRef: VNodeRef = (ref) => {
      if (!ref || !(ref instanceof HTMLElement)) {
        return;
      }
      const key = DOMEditor.findKey(editor, props.text);
      if (ref && KEY_TO_ELEMENT) {
        KEY_TO_ELEMENT.set(key, ref);
        ELEMENT_TO_NODE.set(ref, props.text);
        NODE_TO_ELEMENT.set(props.text, ref);
      }
    };

    const renderProps = useRenderProps();
    const renderTextAttributes: RenderTextProps["attributes"] = {
      "data-slate-node": "text",
      ref: textRef,
    };

    // Skip the forced re-render on the initial mount: there is no committed
    // DOM to restore the selection against yet, and forcing an extra render
    // here breaks contenteditable input in Firefox. Only later decoration
    // changes need to re-render Editable in the same batch as the text
    // components notified above, so its selection-restoration layout effect
    // runs after the decoration-induced DOM changes are committed. Without
    // that, the text components restructure the DOM in a separate pass where
    // Editable's layout effect never fires, potentially leaving the caret at
    // a wrong position.

    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
    const { decorations, update } = useDecorations(props);
    onUpdated(update);

    // Vue has no `React.memo` comparator, so mirror the one slate-react uses
    // for its `Text` component: reuse the previous `parent` when the recreated
    // element is semantically equivalent, otherwise unchanged sibling leaves
    // would re-render together with the changed one.
    const parent = shallowRef(props.parent);
    watch(
      () => [props.parent, props.text] as const,
      ([nextParent, nextText], [prevParent, prevText]) => {
        const equivalent =
          nextText === prevText &&
          isTextParentEquivalent(prevParent, nextParent, prevText, nextText);

        if (!equivalent) {
          parent.value = nextParent;
        }
      },
      { flush: "sync" },
    );

    const decoratedLeaves = computed(() =>
      Text.decorations(props.text, [
        ...props.decorations,
        ...decorations.value,
      ]),
    );

    return () => {
      return renderProps.renderText({
        text: props.text,
        attributes: renderTextAttributes,
        children: renderList(decoratedLeaves.value, (leaf, i) =>
          h(LeafComp, {
            text: props.text,
            leaf: leaf.leaf,
            isLast: props.isLast && i === decoratedLeaves.value.length - 1,
            leafPosition: leaf.position,
            parent: parent.value,
            key: `${props.text.text}-${leaf.position?.end}-${leaf.position?.start}`,
          }),
        ),
      });
    };
  },
});
