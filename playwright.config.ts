import { defineConfig, devices } from "@playwright/test";
import * as os from "os";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const projects = [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      permissions: ["clipboard-read", "clipboard-write"],
      launchOptions: {
        // headless: false,
        /**
         * Enable scrollbars in headless mode.
         */
        ignoreDefaultArgs: ["--hide-scrollbars"],
      },
    },
  },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "mobile",
    use: { ...devices["Pixel 5"] },
  },
];

if (os.type() === "Darwin") {
  projects.push({
    name: "webkit",
    use: { ...devices["Desktop Safari"] },
  });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./integration",
  /* Maximum time one test can run for. */
  timeout: 20 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 8000,
  },
  /* Run tests in files in parallel */
  fullyParallel: !process.env.CI,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // `github` adds annotations for failures, `list` prints every test so the
  // CI log shows progress instead of a wall of dots, `html` is uploaded as an
  // artifact.
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : "list",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    viewport: { width: 1280, height: 720 },
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // Can be overridden with PLAYWRIGHT_BASE_URL env var
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
    /* Collect trace if the first attempt fails. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-first-failure",
    /* Name of attribute for selecting elements by page.getByTestId */
    // The Vue examples tag test ids as `data-testid`, not `data-test-id`
    testIdAttribute: "data-testid",
  },

  /* Configure projects for major browsers */
  projects,

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm dev --port 5173",
    reuseExistingServer: !process.env.CI,
    timeout: 3000,
    port: 5173,
  },
});
