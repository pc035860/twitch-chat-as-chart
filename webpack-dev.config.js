const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const toQuery = require('./libs/toQuery');

/**
 * ENV options for local
 */
const DEV_HOST = process.env.WEBPACK_DEV_HOST || '127.0.0.1';
const DEV_PORT = process.env.WEBPACK_DEV_PORT || '8080';

/**
 * ENV options for development/production
 */
const OUTPUT_FILENAME = (function () {
  return process.env.WEBPACK_OUTPUT_FILENAME || '[name]';
}());
// var CHUNK_FILENAME = (function () {
//   return process.env.WEBPACK_CHUNK_FILENAME || '[name].[chunkhash]'
// }());

const params = {
  sass: {
    outputStyle: 'expanded',
    sourceComments: 'true',
    sourceMap: 'true',
    sourceMapContents: 'true',
    includePaths: [
      // encodeURIComponent(path.resolve(__dirname, "./node_modules/compass-mixins/lib/")),
      // encodeURIComponent(path.resolve(__dirname, "./app/sass/lib/"))
    ]
  },
  url: {
    // and file
    name: '[hash].[ext]',
    limit: 5000
  },
  babel: {
    cacheDirectory: true,
    presets: ['es2015', 'stage-1']
  }
};

const myPath = {
  app: path.resolve(__dirname, 'app'),
  dist: path.resolve(__dirname, 'dev')
};

const config = {
  context: myPath.app,
  entry: {
    app: ['babel-polyfill', './index.js']
  },
  output: {
    publicPath: `http://${DEV_HOST}:${DEV_PORT}/`,
    path: myPath.dist,
    filename: `${OUTPUT_FILENAME}.js`
  },
  cache: true,
  devtool: 'source-map',
  // devtool: 'eval-source-map',
  devServer: {
    host: DEV_HOST,
    port: DEV_PORT,
    contentBase: myPath.dist,
    hot: true,
    inline: true,
    stats: {
      colors: true
    }
  },
  externals: {
    angular: 'angular',
    jquery: 'jQuery',
    firebase: 'firebase',
    Chart: 'Chart',
    moment: 'moment',
    lazy: 'Lazy',
    Twitch: 'Twitch'
  },
  module: {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint',
        exclude: [/node_modules/, path.join(myPath.app, 'lib')]
      }
    ],
    loaders: [
      { test: /\.json$/, loader: 'json', exclude: /node_modules/ },
      { test: /\.js$/, loader: 'ng-annotate', exclude: /node_modules/ },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'stage-1']
        }
      },
      { test: /\.html$/, loader: 'html', exclude: /node_modules/ },
      {
        test: /\.(png|jpg|gif)$/,
        exclude: /node_modules/,
        loaders: [
          `url?${toQuery(params.url)}`,
        ]
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        loaders: [
          `url?${toQuery(params.url)}`,
        ]
      },
      {
        test: /\.(scss|sass)$/,
        exclude: /node_modules/,
        loader: `style?sourceMap!css?sourceMap!postcss!sass?${toQuery(params.sass)}`
      },
    ]
  },
  postcss() {
    return [
      // custom version of postcss-transform-shortcut
      // https://github.com/jonathantneal/postcss-transform-shortcut/issues/3
      require('./libs/postcss-transform-shortcut'),
      require('autoprefixer')('last 2 versions')
    ];
  },
  resolve: {
    alias: {
      _images: path.join(myPath.app, 'images'),
      _utils: path.join(myPath.app, 'utils'),
      _libs: path.join(myPath.app, 'libs'),
      _npm: path.resolve(__dirname, 'node_modules')
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new webpack.ProvidePlugin({
      angular: 'angular',
      $: 'jquery'
    }),
    new CopyWebpackPlugin([
      { from: './libs/bootstrap.min.css', to: './bootstrap.min.css' },
      { from: './images/favicon-*.png', to: './images/', flatten: true },
      { from: './images/fb_share.png', to: './images/', flatten: true }
    ]),
    new HtmlWebpackPlugin({
      hash: false,
      template: './index.html'
    })
  ]
};

module.exports = config;
