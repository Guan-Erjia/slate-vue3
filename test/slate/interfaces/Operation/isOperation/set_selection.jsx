import { Operation } from "slate-vue3/core";

export const input = {
  type: "set_selection",
  properties: {},
  newProperties: {},
};
export const test = (value) => {
  return Operation.isOperation(value);
};
export const output = true;
