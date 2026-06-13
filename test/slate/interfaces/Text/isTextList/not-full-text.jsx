import { Text } from "slate-vue3/core";

export const input = [
  {
    text: "",
  },
  {
    type: "set_node",
    path: [0],
    properties: {},
    newProperties: {},
  },
];
export const test = (value) => {
  return Text.isTextList(value);
};
export const output = false;
