import { Editor } from "slate";
import { createHyperscript } from "slate-hyperscript";
export { withHistory, History } from "slate-history";
export {
  codepointsIteratorRTL,
  getCharacterDistance,
  getWordDistance,
} from "../packages/slate/utils/string";
export { isDeepEqual } from "../packages/slate/utils/deep-equal";
export { Transforms } from "../packages/slate";

/**
 * 给编辑器对象添加测试相关的扩展方法
 *
 * @param editor 编辑器对象
 * @returns 扩展后的编辑器对象
 */
export const withTest = (editor: Editor) => {
  const { isInline, isVoid, isElementReadOnly, isSelectable } = editor;

  editor.isInline = (element) => {
    return "inline" in element && element.inline === true
      ? true
      : isInline(element);
  };

  editor.isVoid = (element) => {
    return "void" in element && element.void === true ? true : isVoid(element);
  };

  editor.isElementReadOnly = (element) => {
    return "readOnly" in element && element.readOnly === true
      ? true
      : isElementReadOnly(element);
  };

  editor.isSelectable = (element) => {
    return "nonSelectable" in element && element.nonSelectable === true
      ? false
      : isSelectable(element);
  };

  return editor;
};

export const jsx = createHyperscript({
  elements: {
    block: {},
    inline: { inline: true },
  },
});

export const resolveModules = async (
  modules: Record<string, () => Promise<any>>,
) =>
  await Promise.all(
    Object.keys(modules).map(async (path) => {
      const module = await modules[path]();
      module.path = path;
      return module;
    }),
  );

export const E2E_BASE_URL = "http://localhost:5173/slate-vue3/examples/";

export const jsxYjs = createHyperscript({
  elements: {
    unstyled: { type: "unstyled" },
    h1: { type: "header-one" },
    ul: { type: "unordered-list" },
    "ul-li": { type: "unordered-list-item" },
    link: { type: "link" },
    "note-link": { type: "note-link" },
  },
});
