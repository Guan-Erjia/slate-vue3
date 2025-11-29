import { direction } from "direction";
import { Editor, Element, Node } from "slate";
import { ChildrenComp } from "./children";
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  DOMEditor,
  IS_FIREFOX,
} from "slate-dom";
import { TextComp } from "./text";
import {
  computed,
  defineComponent,
  h,
  HTMLAttributes,
  onUpdated,
  provide,
  ref,
  VNode,
  VNodeChild,
  VNodeRef,
  watch,
} from "vue";
import { useReadOnly } from "../hooks/use-read-only";
import { SLATE_USE_ELEMENT } from "../utils/constants";
import { useEditor } from "../hooks/use-editor";
import { provideElementDR } from "../render/decorate";
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
    const element = props.element;
    const editor = useEditor();

    provide(
      SLATE_USE_ELEMENT,
      computed(() => element),
    );

    const elementRef = ref<HTMLElement | null>(null);

    watch(
      () => elementRef.value,
      (ref) => {
        const key = DOMEditor.findKey(editor, element);
        const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
        if (ref) {
          KEY_TO_ELEMENT?.set(key, ref);
          NODE_TO_ELEMENT.set(element, ref);
          ELEMENT_TO_NODE.set(ref, element);
        } else {
          KEY_TO_ELEMENT?.delete(key);
          NODE_TO_ELEMENT.delete(element);
        }
      },
    );

    const isInline = computed(() => editor.isInline(element));
    const readOnly = useReadOnly();

    const attributes = computed(() => {
      const attr: ElementAttributes = {
        "data-slate-node": "element",
        ref: elementRef,
      };
      if (isInline.value) {
        attr["data-slate-inline"] = true;
      } else if (Editor.hasInlines(editor, element)) {
        // If it's a block node with inline children, add the proper `dir` attribute for text direction.
        const text = Node.string(element);
        const dir = direction(text);
        if (dir === "rtl") {
          attr.dir = dir;
        }
      }
      if (Editor.isVoid(editor, element)) {
        attr["data-slate-void"] = true;
        if (!readOnly.value && isInline.value) {
          attr.contenteditable = false;
        }
      }
      return attr;
    });

    provideElementDR(element);
    provideIsLastEmptyBlock(element);

    const children = computed<VNode | VNodeChild[]>(() => {
      if (!Editor.isVoid(editor, element)) {
        return h(ChildrenComp, { element });
      }
      const [[text]] = Node.texts(element);
      NODE_TO_INDEX.set(text, 0);
      NODE_TO_PARENT.set(text, element);
      const tag = isInline.value ? "span" : "div";
      return h(tag, VOID_CHILDREN_ATTRS, h(TextComp, { text, isLast: false }));
    });

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
    return () =>
      renderElement({
        attributes: attributes.value,
        children: children.value,
        element,
      });
  },
});
