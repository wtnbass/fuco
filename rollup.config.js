import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";

const terserOpts = {
  compress: {
    keep_infinity: true,
    pure_getters: true,
    passes: 10,
  },
  ecma: 2017,
  toplevel: true,
  mangle: {
    properties: {
      regex: "^_",
    },
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
        $_cleanup: "_c",
      },
    },
  },
};

const bundle = (moduleName, env) => {
  const isProd = env === "production";
  return {
    treeshake: true,
    input: `./src/${moduleName}.ts`,
    output: {
      file: `dist/${moduleName}.${env}.js`,
      format: "es",
    },
    plugins: [
      typescript(),
      replace({ "process.env.BUILD_ENV": JSON.stringify(env) }),
      isProd && terser(terserOpts),
    ].filter(Boolean),
  };
};

export default ["fuco", "server"].flatMap((m) =>
  ["production", "development"].map((e) => bundle(m, e))
);
