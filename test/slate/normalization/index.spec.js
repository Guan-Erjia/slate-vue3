import { withTest, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";
import { Editor } from "slate";

const modules = await resolveModules(import.meta.glob("./**/*.js?(x)"));

describe("slate-normalization", () => {
  modules.forEach((module) => {
    const { input, output, path, withFallbackElement } = module;
    test(path, async () => {
      const editor = withTest(reactive(input));
      if (withFallbackElement) {
        const { normalizeNode } = editor;
        editor.normalizeNode = (entry, options) => {
          normalizeNode(entry, { ...options, fallbackElement: () => ({}) });
        };
      }
      Editor.normalize(editor, { force: true });

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
