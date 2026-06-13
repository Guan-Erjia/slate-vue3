import { Operation } from "slate-vue3/core";

export const input = true;
export const test = (value) => {
  return Operation.isOperationList(value);
};
export const output = false;
