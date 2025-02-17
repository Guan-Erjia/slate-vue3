/** @jsx jsx */
import { Transforms } from "../../packages/slate/src/interfaces/transforms/index";
import { Transforms as Transform1 } from "slate-vue";
import { withHistory, History } from "slate-history";
import { test, expect } from "vitest";
import { withTest, jsx } from "../utils";

const editor = withTest(
  withHistory(
    <editor>
      <block>
        Initial text <cursor />
      </block>
    </editor>
  )
);
console.log(Transform1);

test("after-edit", () => {
  const result = History.isHistory(editor.history);
  Transforms.insertText(editor, "additional text");
  expect(result).toBe(true);
});
