import { withTest, withHistory, History } from "../../utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";

const modules = import.meta.glob("./*.jsx");

describe("isHistory", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      const { run, input } = await modules[path]();
      const editor = withTest(withHistory(reactive(input)));

      run(editor);

      const result = History.isHistory(editor.history);
      expect(result).toBe(true);
    });
  });
});
