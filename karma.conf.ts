import { Config, ConfigOptions } from "karma";

const { DefinePlugin } = require("webpack");

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config: Config) => {
  const options: ConfigOptions = {
    frameworks: ["mocha"],
    files: [{ pattern: "src/__tests__/*_test.ts", watched: false }],
    preprocessors: {
      "src/**/*.ts": ["webpack", "sourcemap"],
    },
    reporters: ["mocha", "coverage-istanbul"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["ChromeHeadless"],
    singleRun: true,
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: {
        extensions: [".ts", ".js"],
      },
      plugins: [
        new DefinePlugin({
          "process.env.BUILD_ENV": JSON.stringify("test"),
        }),
      ],
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [{ loader: "ts-loader" }],
          },
          {
            test: /\.ts$/,
            enforce: "post",
            loader: "istanbul-instrumenter-loader",
            exclude: /(node_modules|__tests__)/,
            options: { esModules: true },
          },
        ],
      },
    },
    webpackMiddleware: {
      stats: "errors-only",
    },
    coverageIstanbulReporter: {
      dir: "coverage/browser",
      combineBrowserReports: true,
      reports: ["lcovonly"],
    },
  };

  if (process.env.DEBUG) {
    Object.assign(options, {
      browsers: ["Chrome"],
      singleRun: false,
    });
  }

  if (process.env.GREP) {
    Object.assign(options, {
      client: {
        mocha: {
          grep: process.env.GREP,
        },
      },
    });
  }

  config.set(options);
};
