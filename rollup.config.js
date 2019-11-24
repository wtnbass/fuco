import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";
import pkg from "./package.json";

const tsOptions = { useTsconfigDeclarationDir: true };

export default [
  {
    input: "./src/core/index.ts",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "esm" }
    ],
    plugins: [typescript(tsOptions), terser(), filesize()]
  },
  {
    input: "./src/server/index.ts",
    output: { file: "server/index.js", format: "cjs" },
    plugins: [typescript(tsOptions), terser(), filesize()]
  }
];
