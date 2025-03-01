import { DOMEditor } from "slate-dom";
import { createHyperscript } from "slate-hyperscript";
export { withHistory, History } from "slate-history";
export {
  codepointsIteratorRTL,
  getCharacterDistance,
  getWordDistance,
} from "../packages/slate/src/utils/string";
export { isDeepEqual } from "../packages/slate/src/utils/deep-equal";

/**
 * 给编辑器对象添加测试相关的扩展方法
 *
 * @param editor 编辑器对象
 * @returns 扩展后的编辑器对象
 */
export const withTest = (editor: DOMEditor) => {
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

export const resolveModules = async (
  modules: Record<string, () => Promise<any>>
) =>
  await Promise.all(
    Object.keys(modules).map(async (path) => {
      const module = await modules[path]();
      module.path = path;
      return module;
    })
  );

export const E2E_BASE_URL = process.env.CI
  ? "https://guan-erjia.github.io/slate-vue3/"
  : "http://localhost:5173/slate-vue3/";
