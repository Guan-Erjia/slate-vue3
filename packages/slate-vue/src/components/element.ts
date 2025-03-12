import { direction } from "direction";
import { BaseElement, Editor, Node, Path, Range } from "slate";
import { ChildrenFC } from "./children";
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
  Fragment,
  h,
  HTMLAttributes,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from "vue";
import { useReadOnly } from "../hooks/use-read-only";
import {
  SLATE_INNER_DESCORATION,
  SLATE_USE_SELECTED,
} from "../utils/constants";
import { useParentDescoration, useRenderElement } from "../hooks/use-render";
import { useEditor } from "../hooks/use-editor";
import { useDecorate } from "../hooks/use-decorate";

interface ElementAttributes extends HTMLAttributes {
  "data-slate-node": "element";
  "data-slate-void"?: true;
  "data-slate-inline"?: true;
  dir?: "rtl";
  ref: any;
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
        if (!readOnly && isInline.value) {
          attr.contenteditable = false;
        }
      }
      return attr;
    });

    const children = computed(() => {
      if (!Editor.isVoid(editor, element)) {
        return h(Fragment, ChildrenFC(element, editor));
      }
      const [[text]] = Node.texts(element);
      NODE_TO_INDEX.set(text, 0);
      NODE_TO_PARENT.set(text, element);
      const tag = isInline.value ? "span" : "div";
      return h(tag, VOID_CHILDREN_ATTRS, h(TextComp, { element, text }));
    });

    const decorate = useDecorate();
    const parentDs = useParentDescoration();
    const provideDs = computed(() => {
      const path = DOMEditor.findPath(editor, element);
      const ds = decorate([props.element, path]);
      const range = Editor.range(editor, path);
      parentDs.value.forEach((dec) => {
        ds.push(Range.intersection(dec, range)!);
      });
      return ds;
    });
    provide(SLATE_INNER_DESCORATION, provideDs);

    const renderElement = useRenderElement();
    return () =>
      renderElement({
        attributes: attributes.value,
        children: children.value,
        element,
      });
  },
});
