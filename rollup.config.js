import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

const tsOpts = { useTsconfigDeclarationDir: true };
const terserOpts = {
  compress: Object.assign({
    keep_infinity: true,
    pure_getters: true,
    passes: 10
  }),
  ecma: 9,
  toplevel: true,
  warnings: true,
  mangle: {
    properties: {
      regex: "^_"
    }
  },
  nameCache: {
    props: {
      cname: 6,
      props: {
        $_listeners: "__l",
        $_performUpdate: "__u",
        $_flushEffects: "__f",
        $_attr: "__a",
        $_observeAttr: "__o",
        $_dispatch: "__d",
        $_adoptStyle: "__s",
        $_values: "_v",
        $_deps: "_d",
        $_effects: "_e",
        $_layoutEffects: "_l",
        $_cleanup: "_c"
      }
    }
  }
};

const CJS_PROD = file => ({
  file: `${file}.production.js`,
  format: "cjs",
  plugins: [terser(terserOpts)]
});

const CJS_DEV = file => ({
  file: `${file}.development.js`,
  format: "cjs"
});

const MJS_PROD = file => ({
  file: `${file}.production.mjs`,
  format: "esm",
  plugins: [terser(terserOpts)]
});

const MJS_DEV = file => ({
  file: `${file}.development.mjs`,
  format: "esm"
});

export default [
  /// mjs
  {
    input: "./src/fuco/index.ts",
    output: [MJS_PROD, MJS_DEV].map(f => f("fuco/fuco")),
    plugins: [typescript(tsOpts)]
  },
  // cjs
  {
    input: "./src/fuco/index.ts",
    output: [CJS_PROD, CJS_DEV].map(f => f("fuco/fuco")),
    external: ["../html"],
    plugins: [typescript(tsOpts)]
  },
  {
    input: "./src/html/index.ts",
    output: [CJS_PROD, CJS_DEV].map(f => f("html/html")),
    plugins: [typescript(tsOpts)]
  },
  {
    input: "./src/server/index.ts",
    output: [CJS_PROD, CJS_DEV].map(f => f("server/server")),
    external: ["../html", "../fuco"],
    plugins: [typescript(tsOpts)]
  }
];
