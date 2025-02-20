import { withTest, withHistory, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";

const modules = await resolveModules(import.meta.glob("./*.jsx"));

describe("undo", () => {
  modules.forEach((module) => {
    const { input, run, output, path } = module;
    test(path, () => {
      const editor = withTest(withHistory(reactive(input)));

      run(editor);
      editor.undo();

      expect(editor.children).toStrictEqual(output.children);
      expect(editor.selection).toStrictEqual(output.selection);
    });
  });
});
