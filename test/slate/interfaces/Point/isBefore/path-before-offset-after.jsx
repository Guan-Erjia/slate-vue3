import { Point } from "slate-vue3/core";

export const input = {
  point: {
    path: [0, 0],
    offset: 4,
  },
  another: {
    path: [0, 1],
    offset: 0,
  },
};
export const test = ({ point, another }) => {
  return Point.isBefore(point, another);
};
export const output = true;
