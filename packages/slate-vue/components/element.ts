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
} from "slate-vue3/dom";
import { TextComp } from "./text";
import {
  computed,
  defineComponent,
  h,
  HTMLAttributes,
  nextTick,
  onUpdated,
  provide,
  VNodeRef,
  watch,
} from "vue";
import { useReadOnly } from "../hooks/use-read-only";
import { SLATE_USE_ELEMENT } from "../utils/constants";
import { useEditor } from "../hooks/use-editor";
import { useDecorations } from "../hooks/use-decorations";
import { useRenderProps } from "../render/fn";
import { ElementProps } from "../utils/interface";

const findSiblingDirection = (siblings: Iterable<Node>) => {
  for (const sibling of siblings) {
    const dir = direction(Node.string(sibling));

    if (dir !== "neutral") {
      return dir;
    }
  }
};

const getEmptyBlockDirection = (element: Element) => {
  const parent = NODE_TO_PARENT.get(element);
  const index = NODE_TO_INDEX.get(element);

  if (!parent || index === undefined) {
    return;
  }

  const before = parent.children.slice(0, index).reverse();
  const after = parent.children.slice(index + 1);
  return findSiblingDirection(before) ?? findSiblingDirection(after);
};

const getMountedChildren = (editor: Editor, element: Element): Node[] =>
  Editor.isVoid(editor, element)
    ? [Node.texts(element).next().value![0]]
    : element.children;

const findUnmountedChild = (editor: Editor, element: Element) =>
  getMountedChildren(editor, element).findIndex(
    (child) => !NODE_TO_ELEMENT.has(child),
  );

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
    userSelect: "none",
    WebkitUserSelect: "none",
  },
};

export const ElementComp = defineComponent({
  name: "slate-element",
  props: ["element", "decorations"],
  setup(props: ElementProps) {
    const editor = useEditor();

    provide(SLATE_USE_ELEMENT, props);

    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
    const elementRef: VNodeRef = (ref) => {
      const key = DOMEditor.findKey(editor, props.element);
      if (!ref) {
        KEY_TO_ELEMENT?.delete(key);
        NODE_TO_ELEMENT.delete(props.element);
        return;
      }
      if (ref && ref instanceof HTMLElement) {
        KEY_TO_ELEMENT?.set(key, ref);
        NODE_TO_ELEMENT.set(props.element, ref);
        ELEMENT_TO_NODE.set(ref, props.element);
        if (IS_FIREFOX) {
          const nodes = ref.childNodes;
          if (!nodes.length) {
            return;
          }
          const lastIndex = nodes.length - 1;
          if (
            nodes[lastIndex].nodeType === 3 &&
            nodes[lastIndex].textContent !== ""
          ) {
            nodes[lastIndex].textContent = "";
          }
        }
      }
    };
    const readOnly = useReadOnly();

    watch(
      () => props.element,
      async () => {
        await nextTick();
        const index = findUnmountedChild(editor, props.element);

        if (index !== -1) {
          const type = (props.element as { type?: unknown }).type;
          const path = DOMEditor.findPath(editor, props.element);
          editor.onDOMError(
            new Error(
              `renderElement didn't render the children of the ${
                typeof type === "string" ? `"${type}" ` : ""
              }element at path ${JSON.stringify(
                path,
              )}: child ${index} has no DOM node. Render the \`children\` prop inside the element.`,
            ),
          );
        }
      },
      { immediate: true },
    );

    const renderProps = useRenderProps();
    const { decorations, update } = useDecorations(props);
    onUpdated(update);

    const decorationsProps = computed(() => [
      ...props.decorations,
      ...decorations.value,
    ]);

    return () => {
      const isInline = editor.isInline(props.element);
      const [[text]] = Node.texts(props.element);
      NODE_TO_INDEX.set(text, 0);
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
        const dir =
          text === "" ? getEmptyBlockDirection(props.element) : direction(text);
        if (dir === "rtl") {
          attributes.dir = dir;
        }
      }

      if (Editor.isVoid(editor, props.element)) {
        NODE_TO_PARENT.set(text, props.element);
        attributes["data-slate-void"] = true;
        if (!readOnly.value && isInline) {
          attributes.contenteditable = false;
        }

        return renderProps.renderElement({
          attributes,
          children: h(
            tag,
            VOID_CHILDREN_ATTRS,
            h(TextComp, {
              text,
              isLast: false,
              decorations: decorationsProps.value,
              parent: props.element,
            }),
          ),
          element: props.element,
          editor,
        });
      }

      return renderProps.renderElement({
        attributes,
        children: h(ChildrenComp, {
          element: props.element,
          decorations: decorationsProps.value,
        }),
        element: props.element,
        editor,
      });
    };
  },
});
