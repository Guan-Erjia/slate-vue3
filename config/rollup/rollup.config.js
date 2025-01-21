import babel from "rollup-plugin-babel";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

import UnProxyWeakmap from "../../packages/un-proxy-weakmap/package.json";
import Core from "../../packages/slate/package.json";
import DOM from "../../packages/slate-dom/package.json";
import Vue from "../../packages/slate-vue/package.json";

/**
 * Return a Rollup configuration for a `pkg`.
 */

function factory(pkg) {
  const input = `packages/${pkg.name}/src/index.ts`;
  const deps = []
    .concat(pkg.dependencies ? Object.keys(pkg.dependencies) : [])
    .concat(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : []);

  // Stop Rollup from warning about circular dependencies.
  const onwarn = (warning) => {
    if (warning.code !== "CIRCULAR_DEPENDENCY") {
      console.warn(`(!) ${warning.message}`); // eslint-disable-line no-console
    }
  };

  const plugins = [
    // Allow Rollup to resolve modules from `node_modules`, since it only
    // resolves local modules by default.
    resolve({
      browser: true,
    }),

    typescript({
      abortOnError: false,
      tsconfig: `./packages/${pkg.name}/tsconfig.json`,
      // COMPAT: Without this flag sometimes the declarations are not updated.
      // clean: isProd ? true : false,
      clean: true,
    }),

    // Convert JSON imports to ES6 modules.
    json(),

    // Replace `process.env.NODE_ENV` with its value, which enables some modules
    // like React and Slate to use their production variant.
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),

    // Register Node.js builtins for browserify compatibility.
    builtins(),

    // Use Babel to transpile the result, limiting it to the source code.
    babel({
      runtimeHelpers: true,
      include: [`packages/${pkg.name}/src/**`],
      extensions: [".js", ".ts", ".tsx"],
      presets: [
        [
          "@babel/preset-env",
          {
            exclude: [
              "@babel/plugin-transform-regenerator",
              "@babel/transform-async-to-generator",
            ],
            modules: false,
            targets: {
              esmodules: true,
            },
          },
        ],
        "@vue/babel-preset-jsx",
      ],
      plugins: [
        "@vue/babel-plugin-jsx",
        [
          "@babel/plugin-transform-runtime",
          {
            regenerator: false,
            useESModules: true,
          },
        ],
        "@babel/plugin-proposal-class-properties",
      ],
    }),

    // Register Node.js globals for browserify compatibility.
    globals(),

    // Only minify the output in production, since it is very slow. And only
    // for UMD builds, since modules will be bundled by the consumer.
  ].filter(Boolean);

  return {
    plugins,
    input,
    onwarn,
    output: [
      {
        file: `packages/${pkg.name}/${pkg.module}`,
        format: "es",
        sourcemap: true,
      },
    ],
    // We need to explicitly state which modules are external, meaning that
    // they are present at runtime. In the case of non-UMD configs, this means
    // all non-Slate packages.
    external: (id) => {
      return !!deps.find((dep) => dep === id || id.startsWith(`${dep}/`));
    },
  };
}

/**
 * Config.
 */

export default [
  factory(UnProxyWeakmap),
  factory(Core),
  factory(DOM),
  factory(Vue),
];
