import { Point } from "slate-vue3/core";

export const input = {
  path: [0, 1],
  offset: 0,
  custom: "value",
};
export const test = (value) => {
  return Point.isPoint(value);
};
export const output = true;
