import { render } from "@testing-library/vue";
import { h } from "vue";
import { describe, expect, test } from "vitest";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import type { Descendant } from "slate";

const value: Descendant[] = [
  { type: "paragraph", children: [{ text: "one" }] } as Descendant,
];

const setup = () => {
  const editor = createReactiveEditor();
  editor.children = value;

  const errors: unknown[] = [];
  editor.onDOMError = (error) => errors.push(error);

  const { container } = render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: () => h(Editable),
    },
  });

  const domText = container.querySelector("[data-slate-string]")!.firstChild!;
  return { editor, errors, domText };
};

const unmountedEditor = () => {
  const editor = createReactiveEditor();
  editor.children = value;
  return editor;
};

describe("resolve lookups", () => {
  test("resolveDOMNode finds rendered nodes and returns null otherwise", () => {
    const { editor, errors } = setup();

    expect(DOMEditor.resolveDOMNode(editor, editor)).toBe(
      DOMEditor.toDOMNode(editor, editor),
    );
    expect(DOMEditor.resolveDOMNode(editor, editor.children[0])).toBe(
      DOMEditor.toDOMNode(editor, editor.children[0]),
    );
    expect(
      DOMEditor.resolveDOMNode(editor, {
        type: "paragraph",
        children: [{ text: "detached" }],
      } as Descendant),
    ).toBeNull();
    expect(
      DOMEditor.resolveDOMNode(unmountedEditor(), editor.children[0]),
    ).toBeNull();
    expect(errors).toEqual([]);
  });

  test("resolveSlateNode finds the node and returns null outside Slate", () => {
    const { editor, errors, domText } = setup();

    expect(DOMEditor.resolveSlateNode(editor, domText)).toBe(
      DOMEditor.toSlateNode(editor, domText),
    );
    expect(
      DOMEditor.resolveSlateNode(editor, document.createElement("div")),
    ).toBeNull();
    expect(
      DOMEditor.resolveSlateNode(editor, document.createTextNode("loose")),
    ).toBeNull();
    expect(errors).toEqual([]);
  });

  test("resolveSlatePoint matches toSlatePoint and returns null on a miss", () => {
    const { editor, errors, domText } = setup();

    expect(DOMEditor.resolveSlatePoint(editor, [domText, 2])).toEqual({
      path: [0, 0],
      offset: 2,
    });
    expect(
      DOMEditor.resolveSlatePoint(editor, [document.createElement("div"), 0]),
    ).toBeNull();
    expect(errors).toEqual([]);
  });

  test("resolveSlatePoint returns null where suppressThrow still throws", () => {
    const editor = unmountedEditor();
    const parent = document.createElement("div");
    const loose = document.createTextNode("loose");
    parent.appendChild(loose);

    expect(() =>
      DOMEditor.toSlatePoint(editor, [loose, 0], {
        exactMatch: false,
        suppressThrow: true,
      }),
    ).toThrow();
    expect(DOMEditor.resolveSlatePoint(editor, [loose, 0])).toBeNull();
  });

  test("resolveSlateRange matches toSlateRange and returns null on a miss", () => {
    const { editor, errors, domText } = setup();
    const domRange = document.createRange();
    domRange.setStart(domText, 1);
    domRange.setEnd(domText, 3);

    expect(DOMEditor.resolveSlateRange(editor, domRange)).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });

    const outside = document.createRange();
    outside.selectNodeContents(document.createElement("div"));
    expect(DOMEditor.resolveSlateRange(editor, outside)).toBeNull();
    expect(errors).toEqual([]);
  });

  test("resolveSlateRange returns null where suppressThrow still throws", () => {
    const { editor } = setup();
    const selection = window.getSelection()!;
    selection.removeAllRanges();

    expect(() =>
      DOMEditor.toSlateRange(editor, selection, {
        exactMatch: false,
        suppressThrow: true,
      }),
    ).toThrow();
    expect(DOMEditor.resolveSlateRange(editor, selection)).toBeNull();
  });
});
