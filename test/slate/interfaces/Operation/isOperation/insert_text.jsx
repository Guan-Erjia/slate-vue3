import { Operation } from "slate-vue3/core";

export const input = {
  type: "insert_text",
  path: [0],
  offset: 0,
  text: "string",
};
export const test = (value) => {
  return Operation.isOperation(value);
};
export const output = true;
