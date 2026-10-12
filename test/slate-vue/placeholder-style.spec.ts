import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  createReactiveEditor,
  Editable,
  RenderPlaceholderProps,
  Slate,
} from "slate-vue3";
import { CSSProperties, h, normalizeStyle } from "vue";
import { render } from "@testing-library/vue";

describe("placeholder style", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("sets the WebKit-prefixed user-select so iOS Safari cannot select it", () => {
    const editor = createReactiveEditor();
    const renderedStyles: CSSProperties[] = [];
    const renderPlaceholder = ({
      attributes,
      children,
    }: RenderPlaceholderProps) => {
      renderedStyles.push(attributes.style as CSSProperties);
      return h("span", attributes, children);
    };

    editor.children = [{ children: [{ text: "" }] }];

    render(Slate, {
      props: {
        editor,
        renderPlaceholder,
      },
      slots: {
        default: h(Editable, {
          placeholder: "Type here",
        }),
      },
    });

    vi.runAllTimers();

    expect(renderedStyles.length).toBeGreaterThan(0);
    console.log(renderedStyles);
    expect(renderedStyles.at(-1)).toMatchObject({
      WebkitUserSelect: "none",
      userSelect: "none",
    });
  });
});
