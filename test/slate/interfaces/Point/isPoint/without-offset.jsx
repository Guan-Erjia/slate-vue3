import { Point } from "slate-vue3/core";

export const input = {
  path: [0, 1],
};
export const test = (value) => {
  return Point.isPoint(value);
};
export const output = false;
