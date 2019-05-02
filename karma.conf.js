module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    files: [{ pattern: "dist/test/**/*_test.js", watched: false }],
    preprocessors: {
      "dist/test/**/*_test.js": ["rollup"]
    },
    reporters: ["mocha"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Firefox"],
    singleRun: true,
    client: {
      jasmine: {
        timeoutInterval: 1000
      }
    },
    rollupPreprocessor: {
      output: {
        format: "iife",
        name: "FWC",
        sourcemap: "inline"
      },
      plugins: [require("rollup-plugin-node-resolve")()]
    }
  });
};
