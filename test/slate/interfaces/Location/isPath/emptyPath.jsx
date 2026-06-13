import { Location, Path } from "slate-vue3/core";

export const input = [];
export const test = (value) => {
  return Location.isPath(value);
};
export const output = true;
