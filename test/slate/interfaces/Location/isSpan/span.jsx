import { Location, Span } from "slate";

export const input = [
  [0, 1],
  [2, 3],
];
export const test = (value) => {
  return Location.isSpan(value);
};
export const output = true;
