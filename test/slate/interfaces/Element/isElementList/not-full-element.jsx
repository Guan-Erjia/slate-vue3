import { Element } from "slate-vue3/core";

export const input = [
  {
    children: [],
  },
  {
    type: "set_node",
    path: [0],
    properties: {},
    newProperties: {},
  },
];
export const test = (value) => {
  return Element.isElementList(value);
};
export const output = false;
