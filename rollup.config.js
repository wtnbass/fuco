import resolve from "rollup-plugin-node-resolve";

export default {
  input: "dist/index.js",
  output: {
    file: "dist/bundle.js",
    format: "esm"
  },
  plugins: [resolve()]
};
