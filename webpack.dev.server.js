const path = require("path");

const webpack = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const merge = require("webpack-merge").merge;
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/i,
        use: ["style-loader", {
          loader: 'css-loader',
          options: { modules: true }
        }, {
          loader: "sass-loader",
          options: {
            implementation: require("sass"), // Prefer `dart-sass`
            webpackImporter: true,
            

          //  sourceMap: true,
          //  sassOptions: {
          //       outputStyle: "compressed",
          //     }
           //api: "modern-compiler",
          },
        },
        ],
      },
    ],
  },
  devServer: {
    //https: true,
    static: path.join(__dirname, ''),
    host: "0.0.0.0",
    port: 8888,
    watchFiles: ["src/**/*","style/**"],
  },
  plugins: [
    //new BundleAnalyzerPlugin()
    new CopyWebpackPlugin({
      patterns: [
        { from: "./style", to: "dist" }
      ],
    }),

    new MiniCssExtractPlugin({
      filename: `./dist/${common.output.filename.replace(/\.js$/, ".css")}`,
    })
  ],
});
