import { direction } from "direction";
import { type DecoratedRange, Editor, Node, Range } from "slate";
import { Children } from "./children";
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  DOMEditor,
} from "slate-dom";
import { TextComp } from "./text";
import type { ElementProps } from "./interface";
import type { JSX } from "vue/jsx-runtime";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from "vue";
import { useReadOnly } from "../hooks/use-read-only";
import { useDecorate } from "../hooks/use-decorate";
import { SLATE_USE_SELECTED } from "../utils/constants";
import { useRenderElement } from "../hooks/use-render";
import { useEditor } from "../hooks/use-editor";

/**
 * Element.
 */
export const ElementComp = defineComponent({
  name: "slate-element",
  props: ["element", "childSelection"],
  setup(props: ElementProps) {
    const { element, childSelection } = props;
    const decorate = useDecorate();
    const editor = useEditor();

    const decorations = computed<DecoratedRange[]>(() => {
      const path = DOMEditor.findPath(editor, element);
      const range = Editor.range(editor, path);
      const ds = decorate([element, path]);
      let parent = Editor.parent(editor, path);
      while (parent[1].length) {
        const parentDs = decorate(parent);
        parentDs.forEach((dec) => {
          ds.push(Range.intersection(dec, range)!);
        });
        parent = Editor.parent(editor, parent[1]);
      }
      return ds;
    });

    const selection = computed(() => {
      const path = DOMEditor.findPath(editor, element);
      const range = Editor.range(editor, path);
      return (
        childSelection.value && Range.intersection(range, childSelection.value)
      );
    });

    const selected = computed(() => !!selection.value);
    provide(SLATE_USE_SELECTED, selected);

    const readOnly = useReadOnly();

    const elementRef = ref<HTMLElement | null>(null);
    onMounted(() => {
      const key = DOMEditor.findKey(editor, element);
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
      if (elementRef.value) {
        KEY_TO_ELEMENT?.set(key, elementRef.value);
        NODE_TO_ELEMENT.set(element, elementRef.value);
        ELEMENT_TO_NODE.set(elementRef.value, element);
      }
    });
    onUnmounted(() => {
      const key = DOMEditor.findKey(editor, element);
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
      KEY_TO_ELEMENT?.delete(key);
      NODE_TO_ELEMENT.delete(element);
    });
    const isInline = computed(() => editor.isInline(element));
    // Attributes that the developer must mix into the element in their
    // custom node renderer component.
    const attributes = computed(() => {
      const attr: {
        "data-slate-node": "element";
        "data-slate-void"?: true;
        "data-slate-inline"?: true;
        contentEditable?: false;
        dir?: "rtl";
        ref: any;
      } = {
        "data-slate-node": "element",
        ref: elementRef,
      };

      if (isInline.value) {
        attr["data-slate-inline"] = true;
      }

      // If it's a block node with inline children, add the proper `dir` attribute
      // for text direction.
      if (!isInline.value && Editor.hasInlines(editor, element)) {
        const text = Node.string(element);
        const dir = direction(text);

        if (dir === "rtl") {
          attr.dir = dir;
        }
      }

      if (Editor.isVoid(editor, element)) {
        attr["data-slate-void"] = true;

        if (!readOnly && isInline.value) {
          attr.contentEditable = false;
        }
      }
      return attr;
    });
    let children: JSX.Element = (
      <Children
        decorations={decorations}
        node={element}
        selection={selection}
      />
    );

    // If it's a void node, wrap the children in extra void-specific elements.
    if (Editor.isVoid(editor, element)) {
      const Tag = isInline.value ? "span" : "div";
      const [[text]] = Node.texts(element);

      children = (
        <Tag
          data-slate-spacer
          style={{
            height: "0",
            color: "transparent",
            outline: "none",
            position: "absolute",
          }}
        >
          <TextComp parent={element} text={text} />
        </Tag>
      );

      NODE_TO_INDEX.set(text, 0);
      NODE_TO_PARENT.set(text, element);
    }

    const renderElement = useRenderElement();
    return () =>
      renderElement({ attributes: attributes.value, children, element });
  },
});
