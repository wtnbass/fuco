import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const source = "dist/index.js";

export default [
  {
    input: source,
    output: {
      file: pkg.main,
      format: "cjs"
    },
    external: [...Object.keys(pkg.dependencies)]
  },
  {
    input: source,
    output: {
      file: pkg.module,
      format: "esm"
    },
    plugins: [resolve(), terser()]
  }
];
