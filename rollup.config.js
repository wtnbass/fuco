import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

const input = "dist/index.js";
const external = Object.keys(pkg.dependencies);

export default [
  {
    input,
    external,
    output: {
      file: pkg.main,
      format: "cjs"
    }
  },
  {
    input,
    external,
    output: {
      file: pkg.module,
      format: "esm"
    },
    plugins: [terser()]
  }
];
