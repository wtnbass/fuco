import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";

export default [
  {
    input: "./index.js",
    external: Object.keys(pkg.dependencies),
    output: {
      file: pkg.main,
      format: "cjs"
    },
    plugins: [resolve(), filesize()]
  },
  {
    input: "./index.js",
    external: Object.keys(pkg.dependencies),
    output: {
      file: pkg.module,
      format: "esm"
    },
    plugins: [resolve(), terser(), filesize()]
  },
  {
    input: "./core/index.js",
    output: {
      file: "./core/core.js",
      format: "cjs"
    },
    plugins: [
      copy({
        targets: [{ src: "src/core/package.json", dest: "core" }]
      })
    ]
  },
  {
    input: "./core/index.js",
    output: {
      file: "./core/core.mjs",
      format: "esm"
    },
    plugins: [terser()]
  }
];
