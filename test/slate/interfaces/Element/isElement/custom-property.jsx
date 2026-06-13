import { Element } from "slate-vue3/core";

export const input = {
  children: [],
  custom: "value",
};
export const test = (value) => {
  return Element.isElement(value);
};
export const output = true;
