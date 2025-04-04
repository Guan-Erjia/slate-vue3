import { withTest, resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import { createEditor } from "slate";
import { cloneDeep } from "lodash-es";

const withBatchTest = (editor, dirties) => {
  const { normalizeNode } = editor;
  editor.normalizeNode = ([node, path]) => {
    dirties.push(JSON.stringify(path));
    normalizeNode([node, path]);
  };
  return editor;
};

const modules1 = await resolveModules(
  import.meta.glob("../transforms/insertNodes/**/*.(j|t)s?(x)")
);
const modules2 = await resolveModules(
  import.meta.glob("../transforms/insertFragment/**/*.(j|t)s?(x)")
);

describe("slate-transforms-insert-nodes", () => {
  modules1.forEach((module) => {
    const { input, run, path } = module;
    test(path, async () => {
      const input2 = createEditor();
      input2.children = cloneDeep(input.children)
      input2.selection = cloneDeep(input.selection);

      const dirties1 = [];
      const dirties2 = [];

      const editor1 = withBatchTest(withTest(input), dirties1);
      const editor2 = withBatchTest(withTest(input2), dirties2);

      run(editor1, { batchDirty: true });
      run(editor2, { batchDirty: false });

      expect(dirties1.join(" ")).toBe(dirties2.join(" "));
    });
  });
});

describe("slate-transforms-insert-fragment", () => {
  modules2.forEach((module) => {
    const { input, run, path } = module;

    test(path, async () => {
      const input1 = createEditor();
      input1.children = cloneDeep(input.children)
      const input2 = createEditor();
      input2.children = cloneDeep(input.children)
      input1.selection = cloneDeep(input.selection);
      input2.selection = cloneDeep(input.selection);

      const dirties1 = [];
      const dirties2 = [];

      const editor1 = withBatchTest(withTest(input1), dirties1);
      const editor2 = withBatchTest(withTest(input2), dirties2);

      run(editor1, { batchDirty: true });
      run(editor2, { batchDirty: false });

      expect(dirties1.join(" ")).toBe(dirties2.join(" "));
    });
  });
});
