module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    files: ["test/**/*_test.ts"],
    preprocessors: {
      "src/**/*.ts": ["webpack", "sourcemap", "coverage"],
      "test/**/*.ts": ["webpack", "sourcemap"]
    },
    reporters: ["mocha", "coverage"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Firefox"],
    singleRun: true,
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [
              {
                loader: "ts-loader",
                options: { transpileOnly: true }
              }
            ]
          },
          {
            test: /\.ts$/,
            enforce: "post",
            loader: "istanbul-instrumenter-loader",
            exclude: /(test|node_modules)/,
            options: { esModules: true }
          }
        ]
      },
      resolve: {
        extensions: [".ts", ".js"]
      }
    },
    coverageReporter: {
      dir: "coverage",
      reporters: [{ type: "lcov", subdir: "." }]
    }
  });
};
