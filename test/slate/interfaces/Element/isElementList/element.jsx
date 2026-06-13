import { Element } from "slate-vue3/core";

export const input = {
  children: [],
};
export const test = (value) => {
  return Element.isElementList(value);
};
export const output = false;
