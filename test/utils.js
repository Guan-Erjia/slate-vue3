import { createHyperscript } from "slate-hyperscript";
export { withHistory, History } from "slate-history";
/**
 * 给编辑器对象添加测试相关的扩展方法
 *
 * @param editor 编辑器对象
 * @returns 扩展后的编辑器对象
 */
export const withTest = (editor) => {
  const { isInline, isVoid, isElementReadOnly, isSelectable } = editor;

  editor.isInline = (element) => {
    return element.inline === true ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.void === true ? true : isVoid(element);
  };

  editor.isElementReadOnly = (element) => {
    return element.readOnly === true ? true : isElementReadOnly(element);
  };

  editor.isSelectable = (element) => {
    return element.nonSelectable === true ? false : isSelectable(element);
  };

  return editor;
};

export const jsx = createHyperscript({
  elements: {
    block: {},
    inline: { inline: true },
  },
});
