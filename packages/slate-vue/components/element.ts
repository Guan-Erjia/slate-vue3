import { direction } from "direction";
import { Editor, Element, Node } from "slate-vue3/core";
import { ChildrenComp } from "./children";
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  DOMEditor,
  IS_FIREFOX,
} from "slate-vue3/dom";
import { TextComp } from "./text";
import {
  defineComponent,
  h,
  HTMLAttributes,
  onUpdated,
  provide,
  ref,
  VNodeRef,
  watch,
} from "vue";
import { useReadOnly } from "../hooks/use-read-only";
import { SLATE_USE_ELEMENT } from "../utils/constants";
import { useEditor } from "../hooks/use-editor";
import { provideIsLastEmptyBlock } from "../render/last";
import { useRenderElement } from "../render/fn";

interface ElementAttributes extends HTMLAttributes {
  "data-slate-node": "element";
  "data-slate-void"?: true;
  "data-slate-inline"?: true;
  dir?: "rtl";
  ref: VNodeRef;
}

const VOID_CHILDREN_ATTRS = {
  "data-slate-spacer": true,
  style: {
    height: "0",
    color: "transparent",
    outline: "none",
    position: "absolute",
  },
};

export const ElementComp = defineComponent({
  name: "slate-element",
  props: ["element"],
  setup(props: { element: Element }) {
    const editor = useEditor();

    provide(SLATE_USE_ELEMENT, props.element);

    const elementRef = ref<HTMLElement | null>(null);

    watch(
      () => elementRef.value,
      (ref) => {
        const key = DOMEditor.findKey(editor, props.element);
        const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
        if (ref) {
          KEY_TO_ELEMENT?.set(key, ref);
          NODE_TO_ELEMENT.set(props.element, ref);
          ELEMENT_TO_NODE.set(ref, props.element);
        } else {
          KEY_TO_ELEMENT?.delete(key);
          NODE_TO_ELEMENT.delete(props.element);
        }
      },
    );

    const readOnly = useReadOnly();

    provideIsLastEmptyBlock(props.element);

    if (IS_FIREFOX) {
      onUpdated(() => {
        const nodes = elementRef.value?.childNodes;
        if (!nodes?.length) {
          return;
        }
        const lastIndex = nodes.length - 1;
        if (
          nodes[lastIndex].nodeType === 3 &&
          nodes[lastIndex].textContent !== ""
        ) {
          nodes[lastIndex].textContent = "";
        }
      });
    }

    const renderElement = useRenderElement();

    return () => {
      const isInline = editor.isInline(props.element);
      const [[text]] = Node.texts(props.element);
      NODE_TO_INDEX.set(text, 0);
      NODE_TO_PARENT.set(text, props.element);
      const tag = isInline ? "span" : "div";

      const attributes: ElementAttributes = {
        "data-slate-node": "element",
        ref: elementRef,
      };

      if (isInline) {
        attributes["data-slate-inline"] = true;
      } else if (Editor.hasInlines(editor, props.element)) {
        // If it's a block node with inline children, add the proper `dir` attribute for text direction.
        const text = Node.string(props.element);
        const dir = direction(text);
        if (dir === "rtl") {
          attributes.dir = dir;
        }
      }

      if (Editor.isVoid(editor, props.element)) {
        attributes["data-slate-void"] = true;
        if (!readOnly.value && isInline) {
          attributes.contenteditable = false;
        }

        return renderElement({
          attributes,
          children: h(
            tag,
            VOID_CHILDREN_ATTRS,
            h(TextComp, { text, isLast: false, elementDR: [] }),
          ),
          element: props.element,
        });
      }

      return renderElement({
        attributes,
        children: h(ChildrenComp, { element: props.element }),
        element: props.element,
      });
    };
  },
});
