import { Location } from "slate-vue3/core";

export const input = {
  path: [0, 1],
  offset: 2,
  custom: "value",
};
export const test = (value) => {
  return Location.isPath(value);
};
export const output = false;
