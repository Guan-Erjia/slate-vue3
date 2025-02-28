import { Element } from "slate";
import { ElementComp } from "./element";
import { TextComp } from "./text";
import { DOMEditor, NODE_TO_INDEX, NODE_TO_PARENT } from "slate-dom";
import { h, renderList, VNode } from "vue";

/**
 * ChildrenFC
 */
export const ChildrenFC = (element: Element, editor: DOMEditor) =>
  renderList(element.children, (child, i): VNode => {
    // 这些逻辑不会触发多余渲染
    const key = DOMEditor.findKey(editor, child);
    // 组件直接传入索引将不会动态更新，必须通过 NODE_TO_INDEX 手动获取索引
    NODE_TO_INDEX.set(child, i);
    NODE_TO_PARENT.set(child, element);

    return Element.isElement(child)
      ? h(ElementComp, { element: child, key: key.id })
      : h(TextComp, { text: child, parent: element, key: key.id });
  });
