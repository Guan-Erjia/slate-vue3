import { expect, Locator } from "@playwright/test";
import type { BaseEditor } from "slate";

export const getEditorHandle = (element: Locator) =>
  element.evaluateHandle((element) => {
    type VueInstance = {
      parent: VueInstance | null;
      props?: { editor?: BaseEditor };
      setupState?: { editor?: BaseEditor };
      proxy?: { editor?: BaseEditor };
    };

    let instance = (
      element as HTMLElement & {
        __vueParentComponent?: VueInstance | null;
      }
    ).__vueParentComponent;

    while (instance) {
      const editor =
        instance.props?.editor ??
        instance.setupState?.editor ??
        instance.proxy?.editor;

      if (editor) {
        return editor;
      }

      instance = instance.parent;
    }

    throw new Error("Cannot find Slate editor instance");
  });

export const clearEditor = async (element: Locator) => {
  await element.click();

  const editor = await getEditorHandle(element);

  await editor.evaluate((editor) => {
    editor.select({
      anchor: editor.start([]),
      focus: editor.end([]),
    });
    editor.deleteFragment();
  });

  await editor.dispose();

  await expect(element.locator("[data-slate-string]")).toHaveCount(0);
};
