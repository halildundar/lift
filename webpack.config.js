import MiniCssExtractPlugin from "mini-css-extract-plugin";
import WebpackShellPluginNext from "webpack-shell-plugin-next";
import { resolve, dirname } from "node:path";
import TerserPlugin from "terser-webpack-plugin";
import nodeExternals from "webpack-node-externals";
import { config } from "dotenv";
config({ path: "./src/const.env" });
console.log(process.env.NODE_ENV);

export default {
  // mode: "development",
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV == "development" ? "eval-source-map" : false, //eval
  entry: {
    server: "./src/server.js",
    viewchanges: "./src/viewschanges.js",
    "public/main": "./src/public/main.js",
    "public/pages/dashboard": "./src/public/pages/dashboard.js",
    "public/signin": "./src/public/pages/auth/signin.js"
  },
  output: {
    path: resolve(process.cwd(), "dist"),
    clean: false,
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /.(scss|css)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            // options: { reloadAll: true },
          },
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },

      {
        test: /\.(png|jp?eg|webp|gif|woff2|ttf|otf|woff|eot|svg)$/i,
        type: "asset/resource",
        generator: {
          outputPath: "public/",
          publicPath: "//",
          // filename:"[name][ext][query]",
          filename: (name) => {
            /**
             * @description Remove first & last item from ${path} array.
             * @example
             *      Orginal Path: 'src/images/avatar/image.jpg'
             *      Changed To: 'images/avatar'
             */
            // console.log(name.filename);
            // console.log(name.filename.split("/").slice(2).join("/"));
            return name.filename.split("/").slice(2).join("/");
          },
        },
      },
      {
        test: /\.(html|hbs|ico|txt|docx|ps1|config|json|env)$/,
        type: "javascript/auto",
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
              outputPath: (url, resourcePath, context) => {
                return url.replace("src/", "");
              },
            },
          },
        ],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: "all",
        extractComments: true,
        minify: TerserPlugin.uglifyJsMinify,
        terserOptions: {
          ecma: import("terser").ECMA | undefined,
          compress: true,
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: true,
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new WebpackShellPluginNext({
      onAfterDone: {
        scripts: ["node copyFolder.js"],
        blocking: false,
        parallel: true,
      },
      // onBeforeCompile: {
      //   scripts: ["taskkill /f /im node.exe"],
      //   blocking: false,
      //   parallel: true,
      // },
      // onBuildStart:{
      //   scripts: ['echo "Webpack Start"'],
      //   blocking: true,
      //   parallel: false
      // },
      // onBuildEnd:{
      //   scripts: ['echo "Webpack End"'],
      //   blocking: true,
      //   parallel: false
      // }
    }),
    // new BrowserSyncPlugin({
    //   // browse to http://localhost:3000/ during development,
    //   // ./public directory is being served
    //   host: 'localhost',
    //   port: 4200,
    //   server: { baseDir: ['dist'] }
    // })
  ],
  externalsPresets: { node: true },
  externals: [nodeExternals()],
};
