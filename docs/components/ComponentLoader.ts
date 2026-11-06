import { defineComponent, h } from "vue";

export const ComponentLoader = defineComponent({
  name: "ComponentLoader",
  setup() {
    return () =>
      h("div", { class: "loading-container loading-spinner" }, [
        h("div", { class: "spinner" }),
        h("p", { class: "loading-text" }, "Loading example..."),
      ]);
  },
});

export const WithChunksLoader = defineComponent({
  name: "HugeDocumentLoader",
  setup() {
    return () =>
      h("div", { class: "loading-container huge-loader-container" }, [
        h("div", { class: "spinner" }),
        h("h2", { class: "loading-text huge-title" }, "Loading Huge Document"),
        h(
          "p",
          { class: "loading-text huge-subtitle" },
          "Preparing thousands of nodes...",
        ),
      ]);
  },
});
