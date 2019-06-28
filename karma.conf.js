module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    files: [{ pattern: "src/**/*_test.ts", watched: false }],
    preprocessors: {
      "src/**/*(?!_test).ts": ["webpack", "sourcemap"],
      "src/**/*_test.ts": ["webpack", "sourcemap"]
    },
    reporters: ["progress", "coverage-istanbul"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["FirefoxHeadless", "ChromeHeadless"],
    singleRun: true,
    client: {
      jasmine: {
        timeoutInterval: 3000
      }
    },
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: {
        extensions: [".ts"]
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [{ loader: "ts-loader" }]
          },
          {
            test: /\.ts$/,
            enforce: "post",
            loader: "istanbul-instrumenter-loader",
            exclude: /(node_modules|test)/,
            options: { esModules: true }
          }
        ]
      }
    },
    webpackMiddleware: {
      stats: "errors-only"
    },
    coverageIstanbulReporter: {
      dir: "coverage",
      reports: ["html", "lcovonly", "text-summary"],
      "report-config": {
        html: {
          subdir: "html"
        }
      }
    }
  });
};
