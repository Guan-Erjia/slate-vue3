import { Element } from "slate-vue3/core";

export const input = {
  element: { children: [] },
  props: {},
};
export const test = ({ element, props }) => {
  return Element.matches(element, props);
};
export const output = true;
