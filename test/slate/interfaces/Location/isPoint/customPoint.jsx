import { Location, Point } from "slate";

export const input = {
  path: [0, 1],
  offset: 2,
  custom: "value",
};
export const test = (value) => {
  return Location.isPoint(value);
};
export const output = true;
