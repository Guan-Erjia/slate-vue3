import { Operation } from "slate-vue3/core";

export const input = {
  path: [0],
  properties: {},
  newProperties: {},
};
export const test = (value) => {
  return Operation.isOperation(value);
};
export const output = false;
