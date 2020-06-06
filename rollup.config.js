import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";

const tsOpts = { useTsconfigDeclarationDir: true };
const terserOpts = {
  compress: {
    keep_infinity: true,
    pure_getters: true,
    passes: 10
  },
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
        // Component
        $_hooks: "_h",
        $_performUpdate: "_u",
        $_flushEffects: "_f",
        $_attr: "_a",
        $_observeAttr: "_o",
        $_dispatch: "_d",
        $_adoptStyle: "_s",
        $_context: "_c",
        // hooks
        $_values: "_v",
        $_deps: "_d",
        $_effects: "_e",
        $_layoutEffects: "_l",
        $_cleanup: "_c"
      }
    }
  }
};

const template = (moduleName, format, env, options) => {
  const isProducton = env === "production";
  const ext = format === "es" ? "mjs" : "js";

  return {
    input: `./src/${moduleName}/index.ts`,
    output: {
      file: `${moduleName}/${moduleName}.${env}.${ext}`,
      format,
      plugins: [isProducton && terser(terserOpts)].filter(Boolean)
    },
    plugins: [
      typescript(tsOpts),
      replace({ "process.env.BUILD_ENV": `"${env}"` })
    ].filter(Boolean),
    ...options
  };
};

export default [
  template("fuco", "es", "production"),
  template("fuco", "es", "development"),
  template("fuco", "cjs", "production", { external: ["../html"] }),
  template("fuco", "cjs", "development", { external: ["../html"] }),
  template("html", "cjs", "production"),
  template("html", "cjs", "development"),
  template("server", "cjs", "production", { external: ["../html", "../fuco"] }),
  template("server", "cjs", "development", {
    external: ["../html", "../fuco"]
  })
];
