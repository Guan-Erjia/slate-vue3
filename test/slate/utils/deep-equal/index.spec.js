import { withTest, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import { Editor } from "slate";
import { resolveModules } from "../../../utils";

const modules = await resolveModules(import.meta.glob("./*.js"));

describe("slate-deep-equal", () => {
  modules.forEach((module) => {
    const { input, test: _test, output, path } = module;
    test(path, async () => {
      if (Editor.isEditor(input)) {
        input = withTest(input);
      }
      const result = _test(input);
      expect(result).toStrictEqual(output);
    });
  });
});
