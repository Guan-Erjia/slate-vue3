import { render } from "@testing-library/vue";
import { defineComponent, h, nextTick, shallowRef, type ShallowRef } from "vue";
import { describe, expect, test, vi } from "vitest";
import { isEqual } from "lodash-es";
import { Transforms } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { useSlateSelector } from "../hooks/use-slate-selector";

describe("useSlateSelector", () => {
  test("should use equality function when selector changes", async () => {
    const editor = createReactiveEditor();
    editor.children = [{ type: "block", children: [{ text: "test" }] }];

    const callback1 = vi.fn(() => []);
    const callback2 = vi.fn(() => []);

    let selected!: ShallowRef<unknown[]>;
    const callback = shallowRef(callback1);

    const Probe = defineComponent({
      props: ["callback"],
      setup(props: { callback: () => unknown[] }) {
        selected = useSlateSelector(() => props.callback(), isEqual);
        return () => null;
      },
    });

    render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: () => [h(Editable), h(Probe, { callback: callback.value })],
      },
    });

    expect(callback1).toHaveBeenCalledTimes(1);

    const firstResult = selected.value;

    Transforms.insertText(editor, "!", { at: { path: [0, 0], offset: 4 } });
    await nextTick();

    expect(callback1).toHaveBeenCalledTimes(2);

    expect(firstResult).toBe(selected.value);

    expect(callback2).toHaveBeenCalledTimes(0);

    callback.value = callback2;
    await nextTick();

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(1);

    expect(firstResult).toBe(selected.value);
  });
});
