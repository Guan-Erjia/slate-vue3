import { Descendant, Node, Path, Transforms } from "slate";
import { describe, expect, test } from "vitest";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";

const paragraph = (text: string) =>
  ({ children: [{ text }] }) as unknown as Descendant;

const renderWithOnChange = (initialValue: Descendant[]) => {
  const editor = createReactiveEditor();
  editor.children = initialValue;

  const seen: { expected: Path; found: Path | string }[][] = [];

  const onChange = () => {
    seen.push(
      Array.from(Node.nodes(editor), ([node, path]) => {
        let found: Path | string;
        try {
          found = DOMEditor.findPath(editor, node);
        } catch (error) {
          found = (error as Error).message;
        }
        return { expected: path, found };
      }),
    );
  };

  render(Slate, {
    props: {
      editor,
      onChange,
    },
    slots: {
      default: h(Editable),
    },
  });

  return { editor, seen };
};

const expectAllFound = (seen: { expected: Path; found: Path | string }[][]) => {
  expect(seen.length).toBeGreaterThan(0);
  for (const entries of seen) {
    for (const { expected, found } of entries) {
      expect(found).toEqual(expected);
    }
  }
};

describe("DOMEditor.findPath inside onChange", () => {
  test("finds every node after a block is split", async () => {
    const { editor, seen } = renderWithOnChange([
      paragraph("first"),
      paragraph("second"),
    ]);

    Transforms.select(editor, { path: [0, 0], offset: 2 });
    editor.insertBreak();
    await nextTick();

    expectAllFound(seen);
  });

  test("finds every node after blocks are removed and moved", async () => {
    const { editor, seen } = renderWithOnChange([
      paragraph("a"),
      paragraph("b"),
      paragraph("c"),
    ]);

    Transforms.removeNodes(editor, { at: [0] });
    Transforms.moveNodes(editor, { at: [1], to: [0] });
    await nextTick();

    expectAllFound(seen);
  });

  test("still throws for a node that is not in the editor", () => {
    const { editor } = renderWithOnChange([paragraph("a")]);

    expect(() => DOMEditor.findPath(editor, paragraph("a") as Node)).toThrow(
      "Unable to find the path for Slate node",
    );
  });
});
