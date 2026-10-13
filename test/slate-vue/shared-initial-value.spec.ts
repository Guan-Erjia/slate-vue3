import { Descendant, Transforms } from "slate";
import { describe, expect, test } from "vitest";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";

const value = () =>
  [{ children: [{ text: "start" }] }] as unknown as Descendant[];

const renderTwo = (first: Descendant[], second: Descendant[]) => {
  const one = createReactiveEditor();
  const two = createReactiveEditor();
  one.children = first;
  two.children = second;

  const { container } = render({
    render() {
      return [
        h(
          Slate,
          { editor: one },
          { default: () => h(Editable, { "data-testid": "one" }) },
        ),
        h(
          Slate,
          { editor: two },
          { default: () => h(Editable, { "data-testid": "two" }) },
        ),
      ];
    },
  });

  return { one, two, container };
};

describe("editors sharing an initialValue", () => {
  test("both render and keep separate documents", async () => {
    const shared = value();
    const { one, two, container } = renderTwo(shared, shared);

    await nextTick();
    Transforms.insertText(one, "X", { at: { path: [0, 0], offset: 0 } });
    await nextTick();

    const [first, second] = Array.from(
      container.querySelectorAll("[data-slate-editor]"),
    );
    expect(first.textContent).toBe("Xstart");
    expect(second.textContent).toBe("start");
    expect(DOMEditor.findPath(one, one.children[0])).toEqual([0]);
    expect(DOMEditor.findPath(two, two.children[0])).toEqual([0]);
  });

  test.skip("the first editor keeps the objects it was given", () => {
    const shared = value();
    const { one, two } = renderTwo(shared, shared);

    expect(one.children[0]).toBe(shared[0]);
    expect(two.children[0]).not.toBe(shared[0]);
    expect(two.children).toEqual(shared);
  });

  test("separate values are not copied", () => {
    const first = value();
    const second = value();
    const { one, two } = renderTwo(first, second);

    expect(one.children[0]).toBe(first[0]);
    expect(two.children[0]).toBe(second[0]);
  });
});
