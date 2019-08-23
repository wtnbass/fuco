import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";

export default [
  {
    input: "./dist/index.js",
    external: Object.keys(pkg.dependencies),
    output: {
      file: pkg.main,
      format: "cjs"
    },
    plugins: [resolve(), filesize()]
  },
  {
    input: "./dist/index.js",
    external: Object.keys(pkg.dependencies),
    output: {
      file: pkg.module,
      format: "esm"
    },
    plugins: [resolve(), terser(), filesize()]
  }
];
