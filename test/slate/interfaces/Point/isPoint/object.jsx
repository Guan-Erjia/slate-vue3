import { Point } from "slate-vue3/core";

export const input = {};
export const test = (value) => {
  return Point.isPoint(value);
};
export const output = false;
