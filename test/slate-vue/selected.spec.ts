import { createEditor, Transforms } from "slate";
import { render } from "@testing-library/vue";
import { DOMEditor, withDOM } from "slate-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { RenderElementProps, useInheritRef, useSelected } from "slate-vue";
import { defineComponent, h, nextTick, useAttrs, watch } from "vue";
import SelectedEditor from "./components/SelectedEditor.vue";

let editor: DOMEditor;
let elementSelectedRenders: Record<string, boolean[] | undefined>;

const clearRenders = () =>
  Object.values(elementSelectedRenders).forEach((selectedRenders) => {
    if (selectedRenders) {
      selectedRenders.length = 0;
    }
  });

const initialValue = () => [
  {
    id: "0",
    children: [
      { id: "0.0", children: [{ text: "" }] },
      { id: "0.1", children: [{ text: "" }] },
      { id: "0.2", children: [{ text: "" }] },
    ],
  },
  { id: "1", children: [{ text: "" }] },
  { id: "2", children: [{ text: "" }] },
];

const MockElement = defineComponent({
  props: ["element"],
  setup(props: { element: any }, { slots }) {
    const attrs = useAttrs();
    const selected = useSelected();

    watch(
      () => selected.value,
      () => {
        const { id } = props.element;
        let selectedRenders = elementSelectedRenders[id];

        if (!selectedRenders) {
          selectedRenders = [];
          elementSelectedRenders[id] = selectedRenders;
        }

        selectedRenders.push(selected.value);
      },
      {
        immediate: true,
      }
    );
    return () => h("div", attrs, slots);
  },
});

describe("useSelected", () => {
  const withChunking = (chunking: boolean) => {
    beforeEach(() => {
      editor = withDOM(createEditor());
      editor.children = initialValue();

      if (chunking) {
        editor.getChunkSize = () => 3;
      }

      elementSelectedRenders = {};

      const renderElement = ({
        element,
        attributes,
        children,
      }: RenderElementProps) =>
        h(
          MockElement,
          { element, ...useInheritRef(attributes) },
          () => children
        );

      render(SelectedEditor, {
        props: {
          editor,
          renderElement,
        },
      });
    });

    it("returns false initially", () => {
      expect(elementSelectedRenders).toEqual({
        "0": [false],
        "0.0": [false],
        "0.1": [false],
        "0.2": [false],
        "1": [false],
        "2": [false],
      });
    });

    it("re-renders elements when it becomes true or false", async () => {
      clearRenders();

      Transforms.select(editor, [0, 0]);

      await nextTick();
      expect(elementSelectedRenders).toEqual({
        "0": [true],
        "0.0": [true],
        "0.1": [],
        "0.2": [],
        "1": [],
        "2": [],
      });

      clearRenders();

      Transforms.select(editor, [2]);
      await nextTick();

      expect(elementSelectedRenders).toEqual({
        "0": [false],
        "0.0": [false],
        "0.1": [],
        "0.2": [],
        "1": [],
        "2": [true],
      });
    });

    it("returns true for elements in the middle of the selection", async () => {
      clearRenders();

      Transforms.select(editor, {
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      });

      await nextTick();
      expect(elementSelectedRenders).toEqual({
        "0": [true],
        "0.0": [],
        "0.1": [true],
        "0.2": [true],
        "1": [true],
        "2": [true],
      });
    });

    it.skip("remains true when the path changes", async () => {
      clearRenders();

      Transforms.select(editor, { path: [2, 0], offset: 0 });

      await nextTick();
      expect(elementSelectedRenders).toEqual({
        "0": [],
        "0.0": [],
        "0.1": [],
        "0.2": [],
        "1": [],
        "2": [true],
      });

      clearRenders();

      Transforms.insertNodes(
        editor,
        { id: "new", children: [{ text: "" }] } as any,
        { at: [2] }
      );

      await nextTick();
      expect(elementSelectedRenders).toEqual({
        "0": [],
        "0.0": [],
        "0.1": [],
        "0.2": [],
        "1": [],
        new: [false],
        "2": [], // Remains true, no rerender
      });
    });
  };

  describe("without chunking", () => {
    withChunking(false);
  });

  describe("with chunking", () => {
    withChunking(true);
  });
});
