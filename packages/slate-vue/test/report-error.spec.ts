import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor, IS_FOCUSED } from "slate-vue3/dom";
import { Editor, Transforms, type Descendant } from "slate";
import { h, defineComponent, onMounted, onUpdated, nextTick } from "vue";
import { render } from "@testing-library/vue";
import { describe, test, expect, vi } from "vitest";
import type { RenderElementProps } from "slate-vue3";

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) =>
  (element as { type?: string }).type === "childless"
    ? h("div", attributes)
    : h("p", attributes, children);

const p = (text: string) =>
  ({ type: "paragraph", children: [{ text }] }) as Descendant;

const childless = {
  type: "childless",
  children: [{ text: "hidden" }],
} as Descendant;

const setup = (initialValue: Descendant[], before?: ReturnType<typeof h>) => {
  const editor = createReactiveEditor();
  editor.children = initialValue;

  const errors: unknown[] = [];
  editor.onDOMError = (error) => errors.push(error);

  render(Slate, {
    props: {
      editor,
      renderElement,
    },
    slots: {
      default: () => [...(before ? [before] : []), h(Editable)],
    },
  });

  return { editor, errors };
};

describe("DOM lookups that may miss", () => {
  test("reports through the global error handler by default", () => {
    const editor = createReactiveEditor();
    const error = new Error("unmapped");
    const reported: unknown[] = [];

    const original = globalThis.reportError;
    globalThis.reportError = (reportedError) => reported.push(reportedError);

    try {
      editor.onDOMError(error);
    } finally {
      globalThis.reportError = original;
    }

    expect(reported).toEqual([error]);
  });

  test("does not report a lookup from a layout effect after typing", async () => {
    const editor = createReactiveEditor();
    editor.children = [p("abc")];

    const errors: unknown[] = [];
    editor.onDOMError = (error) => errors.push(error);

    const Probe = defineComponent({
      setup() {
        const resolveRange = () => {
          if (editor.selection) {
            DOMEditor.resolveDOMRange(editor, editor.selection);
          }
        };

        onMounted(resolveRange);
        onUpdated(resolveRange);

        return () => null;
      },
    });

    render(Slate, {
      props: { editor, renderElement },
      slots: {
        default: () => [h(Probe), h(Editable)],
      },
    });

    Transforms.select(editor, {
      path: [0, 0],
      offset: 3,
    });
    await nextTick();

    Transforms.insertText(editor, "d");
    await nextTick();

    expect(errors).toEqual([]);
    expect(DOMEditor.resolveDOMRange(editor, editor.selection!)).not.toBeNull();
  });

  test("does not report when replaced children leave the selection past the text", async () => {
    const { editor, errors } = setup([p("hello")]);

    IS_FOCUSED.set(editor, true);

    Transforms.select(editor, {
      path: [0, 0],
      offset: 5,
    });
    await nextTick();

    editor.children = [p("hi")];
    editor.onChange();
    await nextTick();

    expect(errors).toEqual([]);
  });

  test("resolveDOMRange returns a range from a layout effect inside the first render", async () => {
    const results: unknown[] = [];
    const editor = createReactiveEditor();
    editor.children = [p("abc")];

    const Widget = defineComponent({
      setup() {
        onMounted(() => {
          try {
            results.push(
              DOMEditor.resolveDOMRange(editor, {
                anchor: { path: [0, 0], offset: 1 },
                focus: { path: [0, 0], offset: 1 },
              }),
            );
          } catch (error) {
            results.push(error);
          }
        });

        return () => null;
      },
    });

    render(Slate, {
      props: {
        editor,
        renderElement: ({ attributes, children }: RenderElementProps) =>
          h("div", attributes, [children, h(Widget)]),
      },
      slots: {
        default: () => h(Editable),
      },
    });

    await nextTick();

    expect(results[0] instanceof Error).toBe(false);
  });

  test("does not throw when a selection ends in an element that does not render its children", async () => {
    const thrown: unknown[] = [];

    const onError = (event: ErrorEvent) => {
      thrown.push(event.error);
      event.preventDefault();
    };

    window.addEventListener("error", onError);

    try {
      const { editor } = setup([p("shown"), childless, p("b")]);

      IS_FOCUSED.set(editor, true);

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });

      await nextTick();
    } catch (error) {
      thrown.push(error);
    } finally {
      window.removeEventListener("error", onError);
    }

    expect(thrown.map(String)).toEqual([]);
  });

  test("reports an element that does not render its children when it mounts", async () => {
    const { errors } = setup([p("shown"), childless]);

    await nextTick();

    expect(errors.map(String)).toEqual([
      `Error: renderElement didn't render the children of the "childless" element at path [1]: child 0 has no DOM node. Render the \`children\` prop inside the element.`,
    ]);
  });

  test("does not report elements and voids that render their children", async () => {
    const editor = createReactiveEditor();
    editor.children = [
      p("a"),
      { type: "image", children: [{ text: "" }] } as Descendant,
      {
        type: "image",
        children: [
          { type: "caption", children: [{ text: "c" }] } as Descendant,
        ],
      } as Descendant,
      p("b"),
    ];

    editor.isVoid = (element) =>
      (element as { type?: string }).type === "image";

    const errors: unknown[] = [];
    editor.onDOMError = (error) => errors.push(error);

    render(Slate, {
      props: {
        editor,
        renderElement,
      },
      slots: {
        default: () => h(Editable),
      },
    });

    Transforms.insertText(editor, "c", {
      at: { path: [3, 0], offset: 1 },
    });

    Transforms.splitNodes(editor, {
      at: { path: [0, 0], offset: 1 },
    });

    await nextTick();

    expect(errors).toEqual([]);
  });

  test("returns null for a range inside an element that does not render its children", () => {
    const { editor, errors } = setup([p("shown"), childless]);
    const reportedOnMount = errors.length;

    expect(
      DOMEditor.resolveDOMRange(editor, {
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 3 },
      }),
    ).toBeNull();

    expect(errors).toHaveLength(reportedOnMount);
  });
});
