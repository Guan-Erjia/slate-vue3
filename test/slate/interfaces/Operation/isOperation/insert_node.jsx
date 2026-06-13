import { Operation } from "slate-vue3/core";

export const input = {
  type: "insert_node",
  path: [0],
  node: {
    children: [],
  },
};
export const test = (value) => {
  return Operation.isOperation(value);
};
export const output = true;
