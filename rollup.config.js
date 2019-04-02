import pkg from "./package.json";
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
    plugins: [terser()],
    external: [...Object.keys(pkg.dependencies)]
  }
];
