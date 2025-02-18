/** @jsx jsx */
import { withTest, withHistory, History } from "../../utils";
import { test, expect, describe } from "vitest";
import { jsx } from "../../utils";
import { reactive } from "vue";

const modules = import.meta.glob("./*.js");

const input = (
  <editor>
    <block>
      Initial text <cursor />
    </block>
  </editor>
);

describe("isHistory", () => {
  Object.keys(modules).forEach(async (path) => {
    test(path, async () => {
      const { run } = await modules[path]();
      const editor = withTest(withHistory(reactive(input)));

      run(editor);

      const result = History.isHistory(editor.history);
      expect(result).toBe(true);
    });
  });
});
