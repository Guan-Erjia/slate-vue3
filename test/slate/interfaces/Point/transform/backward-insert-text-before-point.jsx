import { Point } from "slate-vue3/core";

export const input = {
  path: [0, 0],
  offset: 1,
};

export const test = (value) => {
  return Point.transform(
    value,
    {
      type: "insert_text",
      path: [0, 0],
      text: "a",
      offset: 0,
      properties: {},
    },
    { affinity: "backward" },
  );
};
export const output = {
  path: [0, 0],
  offset: 2,
};
