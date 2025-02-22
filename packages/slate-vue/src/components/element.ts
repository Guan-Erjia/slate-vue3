import { direction } from "direction";
import { BaseElement, Editor, Node, Path, Range } from "slate";
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
import type { ElementProps } from "../utils/interface";
import {
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from "vue";
import { useReadOnly } from "../hooks/use-read-only";
import { SLATE_USE_SELECTED } from "../utils/constants";
import { useRenderElement } from "../hooks/use-render";
import { useEditor } from "../hooks/use-editor";

type AttrType = {
  "data-slate-node": "element";
  "data-slate-void"?: true;
  "data-slate-inline"?: true;
  contentEditable?: false;
  dir?: "rtl";
  ref: any;
};

/**
 * Element.
 */
export const ElementComp = defineComponent({
  name: "slate-element",
  props: ["element"],
  setup(props: ElementProps) {
    const { element } = props;
    const editor = useEditor();

    const selection = computed(() => {
      const path = DOMEditor.findPath(editor, element);
      const elemList: Array<[BaseElement, Path]> = [[element, path]];
      let parent = Editor.parent(editor, path);
      // 递归收集父节点数据
      while (parent[1].length) {
        elemList.unshift(parent);
        parent = Editor.parent(editor, parent[1]);
      }

      let sel = editor.selection;
      // 遍历节点，获取选中范围
      for (const item of elemList) {
        if (sel) {
          sel = Range.intersection(Editor.range(editor, item[1]), sel);
        } else {
          // selection1为空直接退出循环
          break;
        }
      }
      return sel;
    });

    const selected = computed(() => !!selection.value);
    provide(SLATE_USE_SELECTED, selected);

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
    const readOnly = useReadOnly();
    // Attributes that the developer must mix into the element in their
    // custom node renderer component.
    const attributes = computed(() => {
      const attr: AttrType = {
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

    const children = computed(() => {
      // If it's a void node, wrap the children in extra void-specific elements.
      if (Editor.isVoid(editor, element)) {
        const [[text]] = Node.texts(element);

        NODE_TO_INDEX.set(text, 0);
        NODE_TO_PARENT.set(text, element);

        return h(
          isInline.value ? "span" : "div",
          {
            "data-slate-spacer": true,
            style: {
              height: "0",
              color: "transparent",
              outline: "none",
              position: "absolute",
            },
          },
          h(TextComp, { parent: element, text })
        );
      }
      return h(Children, { node: element });
    });

    const renderElement = useRenderElement();
    return () =>
      renderElement({
        attributes: attributes.value,
        children: children.value,
        element,
      });
  },
});
