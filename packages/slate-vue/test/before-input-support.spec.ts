import { afterEach, describe, expect, test, vi } from "vitest";

const loadSupport = async (userAgent: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.navigator,
    "userAgent",
  );

  const prototype = InputEvent.prototype;
  const original = Object.getOwnPropertyDescriptor(
    prototype,
    "getTargetRanges",
  );

  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    get: () => userAgent,
  });

  Object.defineProperty(prototype, "getTargetRanges", {
    configurable: true,
    writable: true,
    value: () => [],
  });

  try {
    // Reload the module to trigger environment detection again.
    vi.resetModules();

    const { HAS_BEFORE_INPUT_SUPPORT } = await import("slate-vue3/dom");

    return HAS_BEFORE_INPUT_SUPPORT;
  } finally {
    if (original) {
      Object.defineProperty(prototype, "getTargetRanges", original);
    } else {
      delete (prototype as { getTargetRanges?: unknown }).getTargetRanges;
    }

    if (descriptor) {
      Object.defineProperty(window.navigator, "userAgent", descriptor);
    } else {
      delete (window.navigator as { userAgent?: string }).userAgent;
    }
  }
};

describe("native beforeinput support detection", () => {
  test("treats legacy desktop Chrome as unsupported", async () => {
    expect(
      await loadSupport(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
      ),
    ).toBe(false);
  });

  test("treats current Chrome as supported", async () => {
    expect(
      await loadSupport(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(true);
  });
});
