module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    files: ["test/**/*_test.ts"],
    preprocessors: {
      "**/*.ts": ["webpack"]
    },
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Firefox"],
    singleRun: false,
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
                options: {
                  transpileOnly: true
                }
              }
            ]
          }
        ]
      },
      resolve: {
        extensions: [".ts", ".js"]
      }
    }
  });
};
