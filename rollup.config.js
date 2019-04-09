import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";

const input = "dist/index.js";
const external = Object.keys(pkg.dependencies);

export default [
  {
    input,
    external,
    output: {
      file: pkg.main,
      format: "cjs"
    },
    plugins: [filesize()]
  },
  {
    input,
    external,
    output: {
      file: pkg.module,
      format: "esm"
    },
    plugins: [terser(), filesize()]
  }
];
