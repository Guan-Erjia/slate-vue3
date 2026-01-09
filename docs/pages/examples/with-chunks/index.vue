<template>
  <div className="performance-controls">
    <p>
      <label>
        Blocks:
        <select v-model="config.blocks">
          <option v-for="block in blocksOptions" :key="block" :value="block">
            {{ block.toString().replace(/(\d{3})$/, ",$1") }}
          </option>
        </select>
      </label>
    </p>

    <details :open="configurationOpen" @toggle="onToggle">
      <summary>Configuration</summary>

      <p>
        <label>
          <input v-model="config.chunking" type="checkbox" />
          Chunking enabled
        </label>
      </p>

      <template v-if="config.chunking">
        <p>
          <label>
            <input v-model="config.chunkDivs" type="checkbox" />
            Render each chunk as a separate <code>div</code>
          </label>
        </p>

        <p v-if="config.chunkDivs">
          <label>
            <input v-model="config.chunkOutlines" type="checkbox" />
            Outline each chunk
          </label>
        </p>

        <p>
          <label>
            Chunk size:
            <select v-model="config.chunkSize">
              <option
                v-for="chunkSize in chunkSizeOptions"
                :key="chunkSize"
                :value="chunkSize"
              >
                {{ chunkSize }}
              </option>
            </select>
          </label>
        </p>
      </template>

      <p>
        <label>
          Set <code>content-visibility: auto</code> on:
          <select v-model="config.contentVisibilityMode">
            <option value="none">None</option>
            <option value="element">Elements</option>
            <option v-if="config.chunking && config.chunkDivs" value="chunk">
              Lowest chunks
            </option>
          </select>
        </label>
      </p>

      <p>
        <label>
          <input v-model="config.showSelectedHeadings" type="checkbox" />
          Call <code>useSelected</code> in each heading
        </label>
      </p>
    </details>

    <details>
      <summary>Statistics</summary>

      <p>
        Last keypress (ms):
        {{
          SUPPORTS_EVENT_TIMING
            ? (lastKeyPressDuration ?? "-")
            : "Not supported"
        }}
      </p>

      <p>
        Average of last 10 keypresses (ms):
        {{
          SUPPORTS_EVENT_TIMING
            ? (averageKeyPressDuration ?? "-")
            : "Not supported"
        }}
      </p>

      <p>
        Last long animation frame (ms):
        {{
          SUPPORTS_LOAF_TIMING
            ? (lastLongAnimationFrameDuration ?? "-")
            : "Not supported"
        }}
      </p>

      <p v-if="SUPPORTS_EVENT_TIMING && lastKeyPressDuration === null">
        Events shorter than 16ms may not be detected.
      </p>
    </details>
  </div>
  <div v-if="rendering">Rendering</div>
  <Slate
    v-else
    :editor
    :render-element
    :render-chunk="config.chunkDivs ? renderChunk : undefined"
  >
    <Editable placeholder="Enter some text…" spellcheck />
  </Slate>
</template>
<script setup lang="ts">
import { faker } from "@faker-js/faker";
import { createEditor as slateCreateEditor, Descendant } from "slate-vue3/core";
import {
  Editable,
  RenderElementProps,
  RenderChunkProps,
  Slate,
  useInheritRef,
} from "slate-vue3";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";
import {
  computed,
  CSSProperties,
  h,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import type {
  HeadingOneElement,
  ParagraphElement,
} from "../../../custom-types.d.ts";
import Heading from "./heading.vue";

interface Config {
  blocks: number;
  chunking: boolean;
  chunkSize: number;
  chunkDivs: boolean;
  chunkOutlines: boolean;
  contentVisibilityMode: "none" | "element" | "chunk";
  showSelectedHeadings: boolean;
}

const SUPPORTS_EVENT_TIMING =
  typeof window !== "undefined" && "PerformanceEventTiming" in window;
const SUPPORTS_LOAF_TIMING =
  typeof window !== "undefined" &&
  "PerformanceLongAnimationFrameTiming" in window;
const chunkSizeOptions = [3, 10, 100, 1000];
const blocksOptions = [
  2, 1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000,
  100000, 200000,
];

const searchParams =
  typeof document === "undefined"
    ? null
    : new URLSearchParams(document.location.search);

const parseNumber = (key: string, defaultValue: number) =>
  parseInt(searchParams?.get(key) ?? "", 10) || defaultValue;

const parseBoolean = (key: string, defaultValue: boolean) => {
  const value = searchParams?.get(key);
  if (value) return value === "true";
  return defaultValue;
};

const parseEnum = <T extends string>(
  key: string,
  options: T[],
  defaultValue: T,
): T => {
  const value = searchParams?.get(key) as T | null | undefined;
  if (value && options.includes(value)) return value;
  return defaultValue;
};

const initialConfig: Config = {
  blocks: parseNumber("blocks", 10000),
  chunking: parseBoolean("chunking", true),
  chunkSize: parseNumber("chunk_size", 1000),
  chunkDivs: parseBoolean("chunk_divs", true),
  chunkOutlines: parseBoolean("chunk_outlines", false),
  contentVisibilityMode: parseEnum(
    "content_visibility",
    ["none", "element", "chunk"],
    "chunk",
  ),
  showSelectedHeadings: parseBoolean("selected_headings", false),
};

const setSearchParams = (config: Config) => {
  if (searchParams) {
    searchParams.set("blocks", config.blocks.toString());
    searchParams.set("chunking", config.chunking ? "true" : "false");
    searchParams.set("chunk_size", config.chunkSize.toString());
    searchParams.set("chunk_divs", config.chunkDivs ? "true" : "false");
    searchParams.set("chunk_outlines", config.chunkOutlines ? "true" : "false");
    searchParams.set("content_visibility", config.contentVisibilityMode);
    searchParams.set(
      "selected_headings",
      config.showSelectedHeadings ? "true" : "false",
    );
    history.replaceState({}, "", `?${searchParams.toString()}`);
  }
};

const cachedInitialValue: Descendant[] = [];

const getInitialValue = (blocks: number) => {
  if (cachedInitialValue.length >= blocks) {
    return cachedInitialValue.slice(0, blocks);
  }

  faker.seed(1);

  for (let i = cachedInitialValue.length; i < blocks; i++) {
    if (i % 100 === 0) {
      const heading: HeadingOneElement = {
        type: "heading-one",
        children: [{ text: faker.lorem.sentence() }],
      };
      cachedInitialValue.push(heading);
    } else {
      const paragraph: ParagraphElement = {
        type: "paragraph",
        children: [{ text: faker.lorem.paragraph() }],
      };
      cachedInitialValue.push(paragraph);
    }
  }

  return cachedInitialValue.slice();
};

const createEditor = (config: Config) => {
  const editor = withHistory(withDOM(slateCreateEditor()));
  editor.getChunkSize = (node) =>
    config.chunking && node === editor ? config.chunkSize : null;
  return editor;
};

const rendering = ref(false);
const config = reactive<Config>(initialConfig);
const editor = ref(createEditor(config));
editor.value.children = getInitialValue(initialConfig.blocks);

const configurationOpen = ref(true);

const onToggle = (event: ToggleEvent) => {
  configurationOpen.value = (event.target as any).open;
};

watch(
  () => config,
  () => {
    rendering.value = true;
    setSearchParams(config);
    setTimeout(() => {
      rendering.value = false;
      editor.value = createEditor(config);
      editor.value.children = getInitialValue(config.blocks);
    });
  },
  {
    deep: true,
  },
);

const keyPressDurations = reactive<number[]>([]);
const lastLongAnimationFrameDuration = ref<number | null>(null);

const lastKeyPressDuration = computed<number | null>(
  () => keyPressDurations[0] ?? null,
);

const averageKeyPressDuration = computed(() =>
  keyPressDurations.length === 10
    ? Math.round(keyPressDurations.reduce((total, d) => total + d) / 10)
    : null,
);

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.name === "keypress") {
      const duration = Math.round(
        // @ts-expect-error Entry type is missing processingStart and processingEnd
        entry.processingEnd - entry.processingStart,
      );
      const remain = keyPressDurations.slice(0, 9);
      keyPressDurations.length = 0;
      keyPressDurations.push(duration, ...remain);
    }
  });
});
const observer1 = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    lastLongAnimationFrameDuration.value = Math.round(entry.duration);
  });
});

onMounted(() => {
  // @ts-expect-error Options type is missing durationThreshold
  observer.observe({ type: "event", durationThreshold: 16 });
  observer1.observe({ type: "long-animation-frame" });
});
onUnmounted(() => {
  observer.disconnect();
  observer1.disconnect();
});

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const style: CSSProperties = {
    contentVisibility:
      config.contentVisibilityMode === "element" ? "auto" : undefined,
  };
  switch (element.type) {
    case "heading-one":
      return h(
        Heading,
        {
          ...useInheritRef(attributes),
          style,
          showSelectedHeadings: config.showSelectedHeadings,
        },
        () => children,
      );
    default:
      return h("p", { ...attributes, style }, children);
  }
};

const renderChunk = ({ attributes, children, lowest }: RenderChunkProps) => {
  const style: CSSProperties = {
    contentVisibility:
      config.contentVisibilityMode === "chunk" && lowest ? "auto" : undefined,
    border: config.chunkOutlines ? "1px solid red" : undefined,
    padding: config.chunkOutlines ? 20 : undefined,
    marginBottom: config.chunkOutlines ? 20 : undefined,
  };

  return h("div", { ...attributes, style }, children);
};
</script>
<style>
.performance-controls {
  padding: 10px 20px;
  margin: 0 -10px 20px -10px;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid lightgrey;
  max-height: 50vh;
  overflow-y: auto;
}

.performance-controls > * {
  margin-top: 10px;
}

.performance-controls > details > :not(summary) {
  margin-left: 10px;
}

.performance-controls p {
  margin-top: 5px;
}

details > summary {
  user-select: none;
}

[data-slate-editor] > * + *,
[data-slate-chunk] > * + * {
  margin-top: 1em;
}
</style>
