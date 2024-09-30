const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
  const htmlTemplate = "./src/index.html";
  const plugins = [new HtmlWebpackPlugin({ template: htmlTemplate })];

  const mode = env && env.prod ? "production" : "development";

  return {
    devtool: "inline-source-map",
    entry: {
      app: "./src/Editor.js",
    },
    mode,
    output: {
      filename: "[name].[contenthash].js",
      clean: true,
    },
    plugins,
    devServer: {
      open: true,
      static: "./dist",
    },
  };
};
