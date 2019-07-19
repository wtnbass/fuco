const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const prod = {
  mode: "production"
};

const dev = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "dist"
  }
};

module.exports = Object.assign(
  process.env.NODE_ENV === "production" ? prod : dev,
  {
    entry: "./src/counter-app.tsx",
    output: {
      filename: "[name].[hash].js",
      path: path.resolve(__dirname, "dist")
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: "ts-loader"
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({ template: "./index.html" })
    ],
    resolve: {
      extensions: [".ts", "tsx", ".js"]
    }
  }
);
