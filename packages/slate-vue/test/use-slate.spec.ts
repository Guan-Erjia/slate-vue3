import { render } from "@testing-library/vue";
import { createTextVNode, defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Transforms } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { useEditorVersion } from "../render/version";

describe("useEditorVersion", () => {
  const ShowVersion = defineComponent({
    setup() {
      const version = useEditorVersion();
      return () => createTextVNode(`V = ${version.value}`);
    },
  });

  it("tracks a global `v` counter for the editor", async () => {
    const editor = createReactiveEditor();
    editor.children = [{ type: "block", children: [{ text: "test" }] }];

    const showThird = ref(false);

    const { getByText } = render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: () => [
          h(Editable),
          h("p", ["First: ", h(ShowVersion, { key: 1 })]),
          h("p", ["Second: ", h(ShowVersion, { key: 2 })]),
          ...(showThird.value
            ? [h("p", ["Third: ", h(ShowVersion, { key: 3 })])]
            : []),
        ],
      },
    });

    expect(getByText("First: V = 0")).not.toBeNull();
    expect(getByText("Second: V = 0")).not.toBeNull();

    Transforms.insertText(editor, "!", { at: { path: [0, 0], offset: 4 } });
    await nextTick();
    await nextTick();

    expect(getByText("First: V = 1")).not.toBeNull();
    expect(getByText("Second: V = 1")).not.toBeNull();

    showThird.value = true;
    await nextTick();

    expect(getByText("First: V = 1")).not.toBeNull();
    expect(getByText("Second: V = 1")).not.toBeNull();
    expect(getByText("Third: V = 1")).not.toBeNull();
  });
});
