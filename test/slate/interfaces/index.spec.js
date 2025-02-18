import { withTest } from "@test-utils";
import { test, expect, describe } from "vitest";
import { reactive } from "vue";
import { Editor } from "slate";

const modules = import.meta.glob("./**/*.(j|t)s?(x)");

describe("slate-interface", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      let { input, test, output, skip } = await modules[path]();
      if (skip) return;
      if (Editor.isEditor(input)) {
        input = withTest(reactive(input));
      } else {
        input = reactive(input);
      }
      const result = test(input);
      expect(result).toStrictEqual(output);
    });
  });
});
