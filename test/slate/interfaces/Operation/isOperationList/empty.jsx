import { Operation } from "slate-vue3/core";

export const input = [];
export const test = (value) => {
  return Operation.isOperationList(value);
};
export const output = true;
