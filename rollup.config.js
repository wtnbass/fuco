import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import * as pkg from "./package.json";

const tsOptions = { useTsconfigDeclarationDir: true };
const terserOptions = {
  compress: Object.assign({
    keep_infinity: true,
    pure_getters: true,
    passes: 10
  }),
  ecma: 9,
  toplevel: true,
  warnings: true
};

export default [
  {
    input: "./src/core/index.ts",
    output: [
      { file: pkg.main, format: "cjs", plugins: [terser(terserOptions)] },
      { file: pkg.module, format: "esm", plugins: [terser(terserOptions)] },
      { file: "core/fuco.dev.js", format: "cjs" },
      { file: "core/fuco.dev.mjs", format: "esm" }
    ],
    plugins: [typescript(tsOptions)]
  },
  {
    input: "./src/server/index.ts",
    output: { file: "server/index.js", format: "cjs" },
    plugins: [typescript(tsOptions), terser(terserOptions)]
  }
];
