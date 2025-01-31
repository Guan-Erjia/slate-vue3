import { Editor, Element } from "slate";
import { ElementComp } from "./element";
import { TextComp } from "./text";
import {
  DOMEditor,
  IS_NODE_MAP_DIRTY,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from "slate-dom";
import type { ChildrenProps } from "./interface";
import { computed, defineComponent, onUpdated } from "vue";
import { useEditor } from "../hooks/use-editor";

/**
 * Children.
 */
export const Children = defineComponent({
  name: "Children",
  props: ["node", "decorations", "selection"],
  setup(props: ChildrenProps) {
    const { decorations, node, selection } = props;
    const editor = useEditor();

    // 更新成功后可信任 selection
    onUpdated(() => {
      IS_NODE_MAP_DIRTY.set(editor, false);
    });

    const path = computed(() => DOMEditor.findPath(editor, node));
    const isLeafBlock = computed(
      () =>
        Element.isElement(node) &&
        !editor.isInline(node) &&
        Editor.hasInlines(editor, node)
    );

    return () =>
      node.children.map((child, i) => {
        // 这些逻辑不会触发多余渲染
        const key = DOMEditor.findKey(editor, child);
        NODE_TO_INDEX.set(child, i);
        NODE_TO_PARENT.set(child, node);

        return Element.isElement(child) ? (
          <ElementComp
            element={child}
            childPath={path}
            childSelection={selection}
            childDecorations={decorations}
            index={i}
            key={key.id}
          />
        ) : (
          <TextComp
            text={child}
            parent={node}
            parentPath={path}
            parentDecorations={decorations}
            index={i}
            key={key.id}
          />
        );
      });
  },
});
