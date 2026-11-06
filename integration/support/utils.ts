import { createHyperscript } from "slate-hyperscript";
export { withHistory, History } from "slate-history";

export const sleep = (ms?: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const resolveModules = async (
  modules: Record<string, () => Promise<any>>,
) =>
  await Promise.all(
    Object.keys(modules).map(async (path) => {
      const module = await modules[path]();
      module.path = path;
      return module;
    }),
  );

export const E2E_BASE_URL = "http://localhost:5173/slate-vue3/examples/";

export const jsxYjs = createHyperscript({
  elements: {
    unstyled: { type: "unstyled" },
    h1: { type: "header-one" },
    ul: { type: "unordered-list" },
    "ul-li": { type: "unordered-list-item" },
    link: { type: "link" },
    "note-link": { type: "note-link" },
  },
});
