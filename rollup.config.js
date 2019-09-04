import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";

export default [
  {
    input: "./index.js",
    output: {
      file: "index.bundle.js",
      format: "cjs"
    },
    plugins: [resolve(), terser(), filesize()]
  },
  {
    input: "./core.js",
    output: {
      file: "core.bundle.js",
      format: "cjs"
    },
    plugins: [terser(), filesize()]
  }
];
