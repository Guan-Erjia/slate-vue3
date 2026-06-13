import { Point } from "slate-vue3/core";

export const input = true;
export const test = (value) => {
  return Point.isPoint(value);
};
export const output = false;
