import { createEditor, Transforms } from "slate-vue3/core";
import { render } from "@testing-library/vue";
import { DOMEditor, withDOM } from "slate-vue3/dom";
import { beforeEach, describe, expect, it } from "vitest";
import {
  Editable,
  RenderElementProps,
  Slate,
  SLATE_USE_ELEMENT,
  useEditor,
  useInheritRef,
  useSelected,
} from "slate-vue3";
import {
  computed,
  defineComponent,
  h,
  nextTick,
  provide,
  useAttrs,
  watch,
} from "vue";

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
      },
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
          () => children,
        );

      render(Slate, {
        props: {
          editor,
          renderElement,
        },
        slots: {
          default: h(Editable),
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

    it("remains true when the path changes", async () => {
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
        { at: [2] },
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

  // https://github.com/ianstormtaylor/slate/issues/6053
  describe("when the referenced element has been removed", () => {
    // Keeps referencing an element after it has been removed from the editor.

    const run = async (chunking: boolean) => {
      const editor = withDOM(createEditor());
      editor.children = [
        { children: [{ text: "one" }] },
        { children: [{ text: "two" }] },
        { children: [{ text: "three" }] },
      ];

      if (chunking) {
        editor.getChunkSize = () => 3;
      }

      let selected: boolean | undefined;
      const captureSelected = (value: boolean) => {
        selected = value;
      };

      const SelectedProbe = defineComponent({
        setup() {
          captureSelected(useSelected({ suppressThrow: true }).value);
          return () => null;
        },
      });

      const StaleConsumer = defineComponent({
        setup() {
          const editor = useEditor();
          provide(
            SLATE_USE_ELEMENT,
            computed(() => editor.children.at(-1)),
          );
          return () => h(SelectedProbe);
        },
      });

      render(Slate, {
        props: { editor },
        slots: {
          default: [h(Editable), h(StaleConsumer)],
        },
      });

      // A selection on a node that survives the removal below.
      Transforms.select(editor, [0, 0]);
      await nextTick();
      Transforms.removeNodes(editor, { at: [2] });
      await nextTick();
      expect(selected).toBe(false);
    };

    it("returns false with suppressThrow (without chunking)", () => run(false));

    it("returns false with suppressThrow (with chunking)", () => run(true));
  });
});
