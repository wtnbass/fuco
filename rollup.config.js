import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const source = "dist/index.js";

const terserOption = {
  warnings: true
};

export default [
  {
    input: source,
    output: {
      file: pkg.main,
      format: "cjs"
    },
    external: ["lit-html"]
  },
  {
    input: source,
    output: {
      file: pkg["main:min"],
      format: "cjs"
    },
    external: ["lit-html"],
    plugins: [terser(terserOption)]
  },
  {
    input: source,
    output: {
      file: pkg.module,
      format: "esm"
    },
    plugins: [resolve()]
  },
  {
    input: source,
    output: {
      file: pkg["module:min"],
      format: "esm"
    },
    plugins: [resolve(), terser(terserOption)]
  }
];
