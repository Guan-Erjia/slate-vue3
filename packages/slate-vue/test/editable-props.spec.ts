import { describe, it, expect } from "vitest";
import { Editable } from "slate-vue3";

type EditableProps = InstanceType<typeof Editable>["$props"];

type TextareaOnlyProp = "rows" | "cols" | "maxLength" | "wrap" | "value";

const acceptsTextareaOnlyProps: Extract<
  TextareaOnlyProp,
  keyof EditableProps
> extends never
  ? false
  : true = false;

const acceptsAutoFocus: "autoFocus" extends keyof EditableProps ? true : false =
  true;

describe("EditableProps", () => {
  it("takes div attributes, not textarea-only ones", () => {
    expect(acceptsTextareaOnlyProps).toBe(false);
    expect(acceptsAutoFocus).toBe(true);
  });
});
