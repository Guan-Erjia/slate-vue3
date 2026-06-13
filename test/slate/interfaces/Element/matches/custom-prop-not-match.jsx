import { Element } from "slate-vue3/core";

export const input = {
  element: { children: [], type: "bold" },
  props: { type: "italic" },
};
export const test = ({ element, props }) => {
  return Element.matches(element, props);
};
export const output = false;
