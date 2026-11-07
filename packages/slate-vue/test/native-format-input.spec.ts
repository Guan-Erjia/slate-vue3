import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { describe, test, expect } from "vitest";
import { Transforms, type Descendant } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";

Object.defineProperty(HTMLElement.prototype, "isContentEditable", {
  configurable: true,
  get() {
    return (
      this.closest("[contenteditable]")?.getAttribute("contenteditable") ===
      "true"
    );
  },
});

const initialValue: Descendant[] = [
  { children: [{ text: "one " }, { text: "two", bold: true } as any] },
];

const renderEditor = () => {
  const editor = createReactiveEditor();
  editor.children = initialValue;
  render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: () => h(Editable),
    },
  });

  const paragraph = DOMEditor.toDOMNode(editor, editor.children[0]);

  return { editor, paragraph };
};

const dispatchFormatInput = (target: HTMLElement) => {
  target.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "formatSetBlockTextDirection",
    }),
  );
};

describe("a native format command that skips beforeinput", () => {
  test("restores wrapped text nodes so later edits render", async () => {
    const { editor, paragraph } = renderEditor();
    const html = paragraph.innerHTML;

    const wrapper = document.createElement("span");
    wrapper.style.direction = "rtl";
    wrapper.append(...Array.from(paragraph.childNodes));
    paragraph.append(wrapper);

    dispatchFormatInput(paragraph);

    expect(paragraph.innerHTML).toBe(html);

    Transforms.delete(editor, {
      at: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 1], offset: 3 },
      },
    });
    await nextTick();

    expect(paragraph.textContent).toBe("\uFEFF");
  });

  test("restores split text and changed attributes", () => {
    const { paragraph } = renderEditor();
    const html = paragraph.innerHTML;

    const string = paragraph.querySelector("[data-slate-string]")!;
    const text = string.firstChild as Text;
    const tail = text.splitText(2);

    const wrapper = document.createElement("span");
    wrapper.append(tail);
    string.append(wrapper);
    string.setAttribute("style", "direction: rtl;");
    string.removeAttribute("data-slate-string");

    dispatchFormatInput(paragraph);

    expect(paragraph.innerHTML).toBe(html);
  });

  test("leaves the DOM alone for other input types", () => {
    const { paragraph } = renderEditor();

    const wrapper = document.createElement("span");
    wrapper.append(...Array.from(paragraph.childNodes));
    paragraph.append(wrapper);

    paragraph.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
      }),
    );

    expect(paragraph.firstChild).toBe(wrapper);
  });
});
