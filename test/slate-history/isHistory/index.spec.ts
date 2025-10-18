import { withTest, withHistory, History, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";

const modules = await resolveModules(import.meta.glob("./*.jsx"));

describe("isHistory", () => {
  modules.forEach((module) => {
    const { run, input, path } = module;
    test(path, () => {
      const editor = withHistory(withTest(reactive(input)));

      run(editor);

      const result = History.isHistory(editor.history);
      expect(result).toBe(true);
    });
  });
});
