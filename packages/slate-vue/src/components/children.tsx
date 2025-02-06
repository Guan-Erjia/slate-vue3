import { Element } from "slate";
import { ElementComp } from "./element";
import { TextComp } from "./text";
import {
  DOMEditor,
  IS_NODE_MAP_DIRTY,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from "slate-dom";
import type { ChildrenProps } from "./interface";
import { defineComponent, onUpdated } from "vue";
import { useEditor } from "../hooks/use-editor";

/**
 * Children.
 */
export const Children = defineComponent({
  name: "Children",
  props: ["node"],
  setup(props: ChildrenProps) {
    const editor = useEditor();

    // 更新成功后可信任 selection
    onUpdated(() => {
      IS_NODE_MAP_DIRTY.set(editor, false);
    });

    return () =>
      props.node.children.map((child, i) => {
        // 这些逻辑不会触发多余渲染
        const key = DOMEditor.findKey(editor, child);
        // 组件直接传入索引将不会动态更新，必须通过 NODE_TO_INDEX 手动获取索引
        NODE_TO_INDEX.set(child, i);
        NODE_TO_PARENT.set(child, props.node);

        return Element.isElement(child) ? (
          <ElementComp element={child} key={key.id} />
        ) : (
          <TextComp text={child} parent={props.node} key={key.id} />
        );
      });
  },
});
