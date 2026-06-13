import { Element } from "slate-vue3/core";

export const input = {
  type: "heading-large",
  children: [{ text: "" }],
};
export const test = (value) => Element.isElementType(value, "paragraph");

export const output = false;
