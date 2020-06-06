module.exports = function(config) {
  const options = {
    frameworks: ["mocha"],
    files: [{ pattern: "**/__tests__/**/*_test.ts", watched: false }],
    preprocessors: {
      "src/**/*.ts": ["webpack"]
    },
    reporters: ["mocha", "coverage-istanbul"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browserConsoleLogOptions: {
      level: "disable"
    },
    autoWatch: false,
    browsers: ["FirefoxHeadless", "ChromeHeadless"],
    singleRun: true,
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: {
        extensions: [".ts", ".js"]
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [{ loader: "ts-loader" }]
          },
          {
            test: /\.ts$/,
            enforce: "pre",
            exclude: /node_modules/,
            use: [{ loader: "webpack-strip-block" }]
          },
          {
            test: /\.ts$/,
            enforce: "post",
            loader: "istanbul-instrumenter-loader",
            exclude: /(node_modules|__tests__)/,
            options: { esModules: true }
          }
        ]
      }
    },
    webpackMiddleware: {
      stats: "errors-only"
    },
    coverageIstanbulReporter: {
      dir: "coverage/browser",
      combineBrowserReports: true,
      reports: ["lcovonly"]
    }
  };

  if (process.env.DEBUG) {
    Object.assign(options, {
      browsers: ["Chrome"],
      singleRun: false
    });
  }

  if (process.env.GREP) {
    Object.assign(options, {
      client: {
        mocha: {
          grep: process.env.GREP
        }
      }
    });
  }

  config.set(options);
};
